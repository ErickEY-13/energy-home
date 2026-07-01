"""Run the FastAPI app programmatically to avoid module-name import issues.

Usage:
    cd Real
    python run_server.py
"""
import uvicorn


def main():
    # Run the app defined in this package: api:app
    # Using reload=True is convenient during development.
    uvicorn.run("api:app", host="127.0.0.1", port=8000, reload=True)


if __name__ == '__main__':
    main()
