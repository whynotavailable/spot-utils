import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public UserSubject: BehaviorSubject<any>
  public AuthToken: string = ""

  constructor() {
    this.UserSubject = new BehaviorSubject<any>(null);
  }
}
