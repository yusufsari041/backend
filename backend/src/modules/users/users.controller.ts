import { Controller, Get, Put, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { CurrentUser } from '../../decorators/user.decorator';
import { UserRole } from '../../entities/user.entity';
import { UpdateProfileDto } from '../../dto/users/update-profile.dto';
import { ChangePasswordDto } from '../../dto/users/change-password.dto';
import { CreateUserDto } from '../../dto/users/create-user.dto';
import { UpdateUserDto } from '../../dto/users/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.getProfile(user.id);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@CurrentUser() user: any, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, updateProfileDto);
  }

  @Put('profile/password')
  @UseGuards(JwtAuthGuard)
  async changeOwnPassword(@CurrentUser() user: any, @Body() changePasswordDto: ChangePasswordDto) {
    return this.usersService.changePassword(user.id, changePasswordDto.yeni_sifre);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findOne(@Param('id') id: number) {
    return this.usersService.findOne(+id);
  }

  @Put(':id/password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async changeUserPassword(
    @CurrentUser() admin: any,
    @Param('id') id: number,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePasswordByAdmin(admin.id, +id, changePasswordDto.yeni_sifre);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createUser(@CurrentUser() admin: any, @Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(admin.id, createUserDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateUser(
    @CurrentUser() admin: any,
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(admin.id, +id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteUser(@CurrentUser() admin: any, @Param('id') id: number) {
    return this.usersService.deleteUser(admin.id, +id);
  }
}

