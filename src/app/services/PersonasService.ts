import { Injectable } from '@angular/core';
import { HttpClient,HttpEvent,HttpRequest,HttpHeaders } from '@angular/common/http';
import { Persona } from '../models/Persona';
import { switchMap, tap } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';


@Injectable({
  providedIn: 'root'
})

export class PersonaService {
  constructor(private httpClient: HttpClient) { }

 GetPersonas() : Observable<Persona[]>{
  const url = environment.url + environment.urlPersonas;
  return this.httpClient.get<Persona[]>(url).pipe(tap(
      (response: Persona[]) => {
        return response;
      })
    );
  }

  CreatePersonas(persona: Persona) : Observable<Persona>{
    const url = environment.url + environment.urlUpdatePersona;
    console.log(url)
    return this.httpClient.post<Persona>(url,persona)
  }

  UpdatePersonas(persona: Persona) : Observable<Persona>{
    const url = environment.url + environment.urlUpdatePersona;
    return this.httpClient.put<Persona>(url,persona)
  }

  DeletePersonas(personaId: number) : Observable<Persona>{
    const url = environment.url + environment.urlDeletePersona + personaId;
    return this.httpClient.delete<Persona>(url)
  }

  getImage(personaId: number): Observable<Blob> {
    const url = environment.url + environment.urlGetImage + personaId;    
    return this.httpClient.get(url, { responseType: 'blob' });    
  }


  sendData(personaId: number, file: File): Observable<any> {
    const url = environment.url + environment.urlLoadtImage + personaId;    
    console.log("guardo imagen")

    const formData: FormData = new FormData();
    formData.append('file', file);
    console.log("envia foto: " + file)
    return this.httpClient.post(url, formData,{
        reportProgress: true,
        responseType: 'json',
      });
  }


  getData(personaId: number): Observable<string> {
     const url = environment.url + environment.urlGetImage + personaId;    
    console.log(url)
    return this.httpClient.get(url, { responseType: 'blob' })
      .pipe(
        switchMap(response => this.readFile(response))
      );
  }

  private readFile(blob: Blob): Observable<string> {
    return Observable.create(obs => {
      const reader = new FileReader();

      reader.onerror = err => obs.error(err);
      reader.onabort = err => obs.error(err);
      reader.onload = () => obs.next(reader.result);
      reader.onloadend = () => obs.complete();

      return reader.readAsDataURL(blob);
    });
  }

}
