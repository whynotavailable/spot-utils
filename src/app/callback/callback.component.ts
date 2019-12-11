import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.scss']
})
export class CallbackComponent implements OnInit {

  constructor(private authService: AuthService, private http: HttpClient,  private router: Router) { }

  ngOnInit() {
    this.authService.AuthToken = window.location.hash.split('&')[0].split('=')[1];
    this.http.get("https://api.spotify.com/v1/me", {
      headers: {
        "authorization": `Bearer ${this.authService.AuthToken}`
      }
    }).subscribe(data => {
      this.authService.UserSubject.next(data);
      console.log(data);
      this.router.navigateByUrl("/home");
    })
  }

}
