import time
import threading
import random
from datetime import datetime
from db_utils import init_db, add_device, insert_measurement

_sim_threads = {}
_conn = None


def _simulate_loop(serial, device_id, interval_s, stop_event):
    # generate values centered around nominal values with smoother noise and periodic pattern
    import math
    base_voltage = 220.0
    base_current = 1.0
    t = 0.0
    # anomaly state: None or dict with keys type and remaining steps
    anomaly_state = None
    while not stop_event.is_set():
        # time progression
        t += interval_s

        # slow periodic variation to emulate daily/usage cycle (period depends on interval)
        # use a low-frequency sine with small amplitude
        period_seconds = 60 * 60 * 6.0  # 6-hour pseudo-cycle for demo
        cycle = math.sin(2 * math.pi * (t % period_seconds) / period_seconds)

        # base voltage fluctuates slightly around nominal (±1%) and follows cycle a bit
        volt = base_voltage * (1.0 + 0.005 * cycle + random.normalvariate(0, 0.002))

        # base current varies more (load changes) and follows cycle
        amp = base_current * (1.0 + 0.5 * (cycle + 1) / 2.0 + random.normalvariate(0, 0.05))

        # manage anomaly state (sustained anomalies)
        if anomaly_state is None:
            # small chance to start an anomaly: spike or drop
            p = random.random()
            if p < 0.01:
                # start a short spike (few steps)
                anomaly_state = {'type': 'spike', 'remaining': random.randint(2, 6)}
            elif p < 0.015:
                # start a sustained drift (drop or high load)
                anomaly_state = {'type': random.choice(['high_load','drop']), 'remaining': random.randint(20, 120)}
        else:
            # apply anomaly effect
            if anomaly_state['type'] == 'spike':
                amp *= (3.0 + random.random() * 2.0)
                volt *= (0.95 + random.random() * 0.1)
            elif anomaly_state['type'] == 'high_load':
                amp *= (1.5 + random.random() * 0.8)
            elif anomaly_state['type'] == 'drop':
                amp *= (0.2 + random.random() * 0.4)

            anomaly_state['remaining'] -= 1
            if anomaly_state['remaining'] <= 0:
                anomaly_state = None

        # compute power and store
        power = volt * amp
        insert_measurement(_conn, device_id, round(volt, 2), round(amp, 3), round(power, 2), datetime.utcnow().isoformat(' '))
        time.sleep(interval_s)


def start_simulator(serial_unico='SIM12345', nombre='SimDevice', interval_s=1):
    global _conn
    if _conn is None:
        _conn = init_db()
    device_id = add_device(_conn, serial_unico, nombre)
    stop_event = threading.Event()
    t = threading.Thread(target=_simulate_loop, args=(serial_unico, device_id, interval_s, stop_event), daemon=True)
    _sim_threads[serial_unico] = (t, stop_event)
    t.start()
    return device_id


def stop_simulator(serial_unico='SIM12345'):
    pair = _sim_threads.get(serial_unico)
    if not pair:
        return False
    t, stop_event = pair
    stop_event.set()
    t.join(timeout=2)
    del _sim_threads[serial_unico]
    return True


def list_simulators():
    return list(_sim_threads.keys())


if __name__ == '__main__':
    print('Starting local simulator for manual test (Ctrl-C to stop)')
    try:
        start_simulator(serial_unico='SIM_TEST_001', nombre='Sim Test Device', interval_s=1)
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        stop_simulator('SIM_TEST_001')
        print('Simulator stopped')
