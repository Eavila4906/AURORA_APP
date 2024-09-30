import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-vender',
  templateUrl: './vender.component.html',
  styleUrls: ['./vender.component.css']
})
export class VenderComponent implements OnInit {
  showDataHead: boolean = false;
  
  constructor() { }

  ngOnInit(): void {
  }


  /**
   * MORE FUNCTIONS
   */

  toggleDataHead(): void {
    this.showDataHead = !this.showDataHead;
  }

}
