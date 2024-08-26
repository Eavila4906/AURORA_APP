import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { AppService } from 'src/app/service/app.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isAuthenticated = false;
  private token: any = null;
  public AuroraApiCore: string = '';
  public AuroraApiRestaurant: string = '';
  public AuroraApiContable: string = '';
  public urlApi: string = '';

  constructor(private http: HttpClient,private Router: Router, private AppService: AppService) {
    this.AuroraApiCore = AppService.getAuroraApiCore();
    this.AuroraApiRestaurant = AppService.getAuroraApiRestaurant();
    this.urlApi = AppService.getAuroraApiRestaurant();
  }
  
  login(user: string, password: string) {
    var formData = new FormData();
    formData.append("user", user);
    formData.append("password", password);
    return this.http.post<any>(`${this.AuroraApiCore}/login`, formData)
  }

  setIsAuthenticated(value: boolean) {
    this.isAuthenticated = value;
  }

  getIsAuthenticated() {
    return this.isAuthenticated;
  }
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken(): string {
    if (!this.token) {
      this.token =  localStorage.getItem('token');
    }
    return this.token;
  }

  logout() {
    const url = this.AuroraApiCore + '/logout';
    return this.http.post(url, null);
  }

  verifyLogin() {
    let userData = localStorage.getItem('userData');
    if (!userData) {
      this.Router.navigate(['login']);
    } else {
      let data = JSON.parse(userData);
      if (data.access_token) {
        this.Router.navigate(['principal']);
      }
    }
  }
}
