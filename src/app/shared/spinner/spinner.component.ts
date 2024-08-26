import { Component, OnInit } from '@angular/core';
import { SpinnerService } from '../service/spinner.service';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.css']
})
export class SpinnerComponent implements OnInit {
  cargando = this.spinner.cargando;
  constructor(private spinner: SpinnerService) { }

  ngOnInit(): void {
  }

}
