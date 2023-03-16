import { Component, OnInit } from '@angular/core';
import { Persona } from '../../models/Persona';
import { PersonaService } from '../../services/PersonasService';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-personas',
  templateUrl: './personas.component.html',  
  styleUrls: ['./personas.component.css']
})

export class PersonasComponent implements OnInit {  
  editar = false;
  crear = false;
  personaId = 0
  nombre= ""
  apellido= ""
  fechaNacimiento= ""
  estadoCivil= ""
  tieneHermanos= 0
  personas: Persona[]
  persona: Persona
  model: NgbDateStruct;
  date: { year: number; month: number };
  form: FormGroup;
  dbImage: any;
  mensaje ="";
  errorStatus:boolean = false;
  errorMsj: any = "";
 
  selectedFiles?: FileList;
  currentFile?: File;
  progress = 0;
  message = '';
  preview = '';
  imageInfos?: Observable<any>;

  Hermanos: any = [{
    value : true,
    viewValue : 'Sí'
  },{
    value : false,
    viewValue : 'No'
  }];

  EstadoCivil: any = [{
    value : 1,
    viewValue : 'Casado'
  },{
    value : 0,
    viewValue : 'Soltero'
  }];

  constructor(private Api: PersonaService,private fb: FormBuilder) {
    this.form = this.fb.group({
      personaId: ['', [Validators.required]],
      nombre: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(10)]],
      apellido: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(10)]],
      fechaNacimiento: ['', []],
      estadoCivil: ['', []],
      tieneHermanos: ['', []],
    })
      console.log('hola')
    console.log('hola a todos')
  }
  get f(){
    return this.form.controls;
  }

  ngOnInit(): void {
    this.GetPersonas ();  
    console.log("inicio")
  }

  volver(){
    this.editar=false;
    this.crear=false;
  }
  GetPersonas (){
    this.Api.GetPersonas().subscribe ((data: Persona[]) =>{
      this.personas=data;
    })
  }

  UpdatePersonas(personaId: number, nombre: string, apellido: string,fechaNacimiento: Date,estadoCivil: string,tieneHermanos: boolean){
    this.errorStatus = false;
    this.dbImage=null;
    this.getImage(personaId)
    this.editar=true;
    this.crear=false;
    this.personaId=personaId;

    const date = new Date(fechaNacimiento);
    console.log(estadoCivil)

    this.form.setValue({
      personaId: personaId,
      nombre: nombre,
      apellido: apellido,
      fechaNacimiento: date,
      estadoCivil: estadoCivil,
      tieneHermanos: tieneHermanos
   });

   this.form.controls['fechaNacimiento'].setValue(date);
  }

  CreatePersona(){
    this.errorStatus = false;
    this.crear=true;
    this.editar=false;
    const date = new Date();
    this.dbImage=null;
    this.form.setValue({
      personaId: 0,
      nombre: "",
      apellido: "",
      fechaNacimiento: "",
      estadoCivil: 0,
      tieneHermanos: true
   });
  }

  isCorrectDate(date) {
    if (date instanceof Date) {
        var text = Date.prototype.toString.call(date);
        return text !== 'Invalid Date';
    }
    return false;
}

  SavePersona(){    
    if (this.form.invalid) {
      this.errorStatus = true;
      this.errorMsj= "Diligencie el formulario"
      return;
    }
    this.errorStatus = true;

    const date = new Date(this.form.get('fechaNacimiento')?.value.year,this.form.get('fechaNacimiento')?.value.month-1,this.form.get('fechaNacimiento')?.value.day);//this.form.get('fechaNacimiento')?.value);
    console.log(date)
    
    if (this.isCorrectDate(date)){      
      this.persona = {
      personaId: this.form.get('personaId')?.value,
      nombre: this.form.get('nombre')?.value,
      apellido: this.form.get('apellido')?.value,
      fechaNacimiento: date,
      fotoUsuario: "",
      estadoCivil: this.form.get('estadoCivil')?.value,
      tieneHermanos: this.form.get('tieneHermanos')?.value=="true" ? true : false,
    }

    console.log(this.persona)
    if (this.editar){
      this.Api.UpdatePersonas(this.persona).subscribe ((data:Persona) =>{
        this.editar = false;
        this.GetPersonas();

      })
    }
    else if (this.crear){
      this.Api.CreatePersonas(this.persona).subscribe ((data:Persona) =>{
        this.crear = false;
        this.GetPersonas();
      })
    }
  }
  else{
    this.errorStatus = true;
    this.errorMsj= "La fecha no es valida"
  }
}

  DeletePersona(personaId: number){
    console.log(personaId)
    this.Api.DeletePersonas(personaId).subscribe ((data:Persona) =>{
      console.log(data)
      this.editar = false;
      this.GetPersonas();

    })
  }

  getImage(personaId: number) {
    this.Api.getData(personaId).subscribe(
        imgData => this.dbImage = imgData,
        err => console.log(err)
      );
  }

  selectFile(event: any): void {
    this.message = '';
    this.preview = '';
    this.progress = 0;
    this.selectedFiles = event.target.files;
  
    if (this.selectedFiles) {
      const file: File | null = this.selectedFiles.item(0);
  
      if (file) {
        this.preview = '';
        this.currentFile = file;
  
        const reader = new FileReader();
  
        reader.onload = (e: any) => {
          console.log(e.target.result);
          this.preview = e.target.result;
        };
  
        reader.readAsDataURL(this.currentFile);
      }      
    }
  }

  sendImage(personaId: number): void {
    this.progress = 0;
  
    if (this.selectedFiles) {
      const file: File | null = this.selectedFiles.item(0);
  
      if (file) {
        this.currentFile = file;
        console.log("persona: " + personaId)
        this.Api.sendData(personaId,this.currentFile).subscribe(
          response => {
            this.getImage(personaId)
          },          
          // Error: (err: any) => {
          //   console.log(err);
          //   this.progress = 0;
  
          //   if (err.error && err.error.message) {
          //     this.message = err.error.message;
          //   } else {
          //     this.message = 'Could not upload the image!';
          //   }
  
          //   this.currentFile = undefined;
          // }          ,
        );
      }
  
      this.selectedFiles = undefined;
    }
  }
}

