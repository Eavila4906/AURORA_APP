import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

import { AppService } from 'src/app/services/app.service';
import { StockService } from './services/stock.service'; 

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css']
})
export class StockComponent implements OnInit {
  permission_read: boolean = true;
  permission_create: boolean = true;
  permission_update: boolean = true;
  permission_delete: boolean = true;

  loading = true;

  stock: any[] = [];

  //Search
  search: string = '';
  stockFilter: any[] = [];

  //Paginate
  currentPage = 1;
  recordPerPage = 5;

  constructor(
    private AppService: AppService,
    private StockService: StockService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const modulo = this.AppService.getEntityModulation(this.router.url)[0];

    this.AppService.getPermissions(modulo.id, modulo.type).subscribe(
      response => {
        this.permission_read = response.data.r == 1 ? true : false;
        this.permission_create = response.data.w == 1 ? true : false;
        this.permission_update = response.data.u == 1 ? true : false;
        this.permission_delete = response.data.d == 1 ? true : false;
      }
    );

    this.StockService.getAll().subscribe(
      response => {
        this.stock = response.data.sort((a: any, b: any) => b.id - a.id);
        this.stockFilter = this.stock;
        this.loading = false;
      }
    );
  }

  /**
   * MORE FUNCTIONS
   */

  //Search
  Search() {
    this.stockFilter = this.stock.filter((stock: { 
      nombreProducto: string
    }) => {
      let filter = true;
      if (this.search) {
        filter = stock.nombreProducto?.toLowerCase().includes(this.search.toLowerCase());
      }
      return filter;
    });
  }

  //Paginate
  countRangeRegister(): string {
    const startIndex = (this.currentPage - 1) * this.recordPerPage + 1;
    const endIndex = Math.min(startIndex + this.recordPerPage - 1, this.stockFilter.length);
    let msg;
    endIndex === 0 ? msg = 'No hay registros.' : msg = `Mostrando registros del ${startIndex} al ${endIndex}`;
    return msg;
  }

}
