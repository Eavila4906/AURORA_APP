import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuroraModule } from './aurora/aurora.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NotFoundComponent } from './errors/NotFound/not-found/not-found.component';
import { SpinnerComponent } from './shared/spinner/spinner.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { SnpinnerInterceptor } from './shared/interceptors/spinner.interceptor';

// import function to register Swiper custom elements
import { register } from 'swiper/element/bundle';
import { RecargarPaginaService } from './shared/service/recargar-pagina.service';
import { BaseComponent } from './aurora/base/base.component';
import { LoginComponent } from './auth/login/login.component';

// register Swiper custom elements
register();
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    BaseComponent,
    NotFoundComponent,
    SpinnerComponent
  ],
  imports: [
    RouterModule,
    AuroraModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    NgxPaginationModule,
    
    ToastrModule.forRoot(),
  ],
  providers: [
    RecargarPaginaService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: SnpinnerInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
