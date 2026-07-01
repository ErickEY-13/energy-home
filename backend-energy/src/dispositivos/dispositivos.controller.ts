import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { DispositivosService } from './dispositivos.service';
import { AdoptarDispositivoDto, CreateDispositivoDto, PersonalizarDispositivoDto } from './dto';
import { JwtAuthGuard, RolesGuard, Roles, GetUser } from '../common';

@ApiTags('Dispositivos')
@Controller('dispositivos')
export class DispositivosController {
  constructor(private readonly dispositivosService: DispositivosService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener todos mis dispositivos con personalización' })
  @ApiResponse({
    status: 200,
    description: 'Lista de dispositivos del usuario con sus personalizaciones',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async findAll(@GetUser('id') usuarioId: number) {
    return this.dispositivosService.findAllByUser(usuarioId);
  }

  @Get('tipos-objeto')
  @ApiOperation({ summary: 'Obtener lista de tipos de objetos/electrodomésticos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tipos de objetos disponibles',
  })
  getTiposObjeto() {
    return this.dispositivosService.getTiposObjeto();
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener todos los dispositivos del sistema (Solo Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Lista completa de dispositivos con info de usuarios asignados',
  })
  @ApiResponse({ status: 403, description: 'Solo administradores' })
  async findAllAdmin() {
    return this.dispositivosService.findAllAdmin();
  }

  @Post('adoptar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Adoptar un dispositivo existente con personalización opcional' })
  @ApiBody({ type: AdoptarDispositivoDto })
  @ApiResponse({
    status: 201,
    description: 'Dispositivo adoptado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Dispositivo no encontrado' })
  @ApiResponse({ status: 409, description: 'Ya has adoptado este dispositivo' })
  async adoptar(
    @GetUser('id') usuarioId: number,
    @Body() adoptarDto: AdoptarDispositivoDto & PersonalizarDispositivoDto,
  ) {
    return this.dispositivosService.adoptar(usuarioId, adoptarDto);
  }

  @Patch(':id/personalizar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Personalizar un dispositivo adoptado (nombre, tipo, ubicación)' })
  @ApiParam({ name: 'id', description: 'ID del dispositivo' })
  @ApiBody({ type: PersonalizarDispositivoDto })
  @ApiResponse({
    status: 200,
    description: 'Dispositivo personalizado exitosamente',
  })
  @ApiResponse({ status: 403, description: 'No tienes acceso a este dispositivo' })
  async personalizar(
    @GetUser('id') usuarioId: number,
    @Param('id', ParseIntPipe) dispositivoId: number,
    @Body() dto: PersonalizarDispositivoDto,
  ) {
    return this.dispositivosService.personalizar(usuarioId, dispositivoId, dto);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear/Registrar un nuevo dispositivo (Solo Admin)' })
  @ApiBody({ type: CreateDispositivoDto })
  @ApiResponse({
    status: 201,
    description: 'Dispositivo creado exitosamente con su apiKey',
  })
  @ApiResponse({ status: 409, description: 'El serialUnico ya está registrado' })
  @ApiResponse({ status: 403, description: 'Solo administradores' })
  async create(@Body() createDto: CreateDispositivoDto) {
    return this.dispositivosService.create(createDto);
  }
}
