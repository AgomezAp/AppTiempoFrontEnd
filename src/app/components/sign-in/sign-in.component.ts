import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';

import { Area } from '../../interfaces/area';
import { Role } from '../../interfaces/role';
import { User } from '../../interfaces/user';
import { AreaService } from '../../services/area.service';
import { ErrorsService } from '../../services/errors.service';
import { RoleService } from '../../services/role.service';
import { UserService } from '../../services/user.service';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';

@Component({
  selector: 'app-sign-in',
  imports: [CommonModule, FormsModule, SpinnerComponent],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css',
})
export class SignInComponent implements OnInit {
  roleList: Role [] = [];
  areaList: Area [] = [];
  name: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';
  repeatPassword: string = '';
  Rid: number |undefined;
  Aid: number |undefined;
  Uid: number | undefined;
  loading: boolean = false;
  constructor(
    private toastr: ToastrService,
    private userService: UserService,
    private router: Router,
    private errorService : ErrorsService,
    private rolService :RoleService,
    private areaService :AreaService
  ) {}

  getRole(){
    this.rolService.getRoleS().subscribe(data=>{
      this.roleList = data
    })
    
  }
  getArea(){
    this.areaService.GetArea().subscribe(data=>{
      this.areaList = data
    })
  }

  ngOnInit(): void {
    this.getArea()
    this.getRole()
  }
  agregarUsuario() {
    if (
      this.name == '' ||
      this.lastName == '' ||
      this.email == '' ||
      this.password == '' ||
      this.repeatPassword == ''
    ) {
      this.toastr.error('todos los campos son obligatorios', 'Error');
     
      return;
    }
    if (this.password != this.repeatPassword) {
      this.toastr.warning('Las contraseñas no coinciden', 'Advertencia');
      return 
    }

    //Creación Objeto

    const user: User = {
      Uid: this.Uid,
      name: this.name,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
      Rid:this.Rid,
      Aid:this.Aid
    };
    this.loading = true;
    this.userService.signIn(user).subscribe({
      next: (v) => {
        this.loading = false;

        this.toastr.success(`${this.name}${this.lastName} creado exitosamente`);
        this.router.navigate(['/logIn']);
      },
      error: (e:HttpErrorResponse) => { 
          this.errorService.messageError(e)

        },
      complete: () => console.info('complete') 
    })
    
  }
}
