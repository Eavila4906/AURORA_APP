import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-modulacion',
  templateUrl: './modulacion.component.html',
  styleUrls: ['./modulacion.component.css']
})
export class ModulacionComponent implements OnInit {
  opcion: string = '1';

  constructor() { }

  ngOnInit(): void {
  }

}
