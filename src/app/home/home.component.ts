import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth.service';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  viewModel = {
    user: null,
    playlistName: "new random playlist"
  }

  tracks = []

  constructor(private authService: AuthService, private http: HttpClient) { }

  ngOnInit() {
    this.authService.UserSubject.subscribe(user => {
      this.viewModel.user = user;

      if (user === null) {
        return;
      }

      let tracks = localStorage.getItem(user.id + "tracks");

      if (tracks !== null) {
        this.tracks = JSON.parse(tracks);
      }
    })
  }

  ngOnDestroy() {
    // will be used later
  }

  generatePlaylist() {
    let copy = this.shuffleArray(this.tracks).slice(0, 100);

    this.http.post<any>(`https://api.spotify.com/v1/users/${this.viewModel.user.id}/playlists`, {
      name: this.viewModel.playlistName,
      public: false,
      description: 'Random Playlist'
    }, {
      headers: {
        "authorization": `Bearer ${this.authService.AuthToken}`
      }
    }).subscribe(data => {
      this.saveSongs(data.id, copy);
    })
  }
  saveSongs(id: string, tracks: string[]) {
    this.http.post<any>(`https://api.spotify.com/v1/users/${this.viewModel.user.id}/playlists/${id}/tracks`, {
      uris: tracks
    }, {
      headers: {
        "authorization": `Bearer ${this.authService.AuthToken}`
      }
    }).subscribe(data => {
      alert(JSON.stringify(data));
    })
  }

  shuffleArray(array) {
    let newArr = [...array];
    for (var i = newArr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = newArr[i];
      newArr[i] = newArr[j];
      newArr[j] = temp;
    }
    return newArr;
  }

  login() {
    let scopes = 'user-read-private user-read-email user-library-read playlist-modify-public playlist-modify-private'
    let loginUrl = `https://accounts.spotify.com/authorize?response_type=token&client_id=${environment.clientId}&scopes=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(window.location.origin + "/callback")}`
    window.location.href = loginUrl;
  }

  loadTracks() {
    let tracks = [];

    let getTracks = (uri) => {
      this.http.get<any>(uri, {
        headers: {
          "authorization": `Bearer ${this.authService.AuthToken}`
        }
      }).subscribe(data => {
        tracks = tracks.concat(data.items);
        if (data.next !== null) {
          getTracks(data.next);
        }
        else {
          this.tracks = tracks.map(x => x.track.uri);
          localStorage.setItem(this.viewModel.user.id + "tracks", JSON.stringify(this.tracks));
        }
      })
    }

    getTracks("https://api.spotify.com/v1/me/tracks?limit=50");

  }
}
