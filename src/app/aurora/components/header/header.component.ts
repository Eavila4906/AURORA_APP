import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AppService } from 'src/app/services/app.service';

interface Module {
  module_id: number;
  module_name: string;
  module_path: string;
  full_path: string;
  submodules: Submodule[];
  open_module: boolean;
}

interface Submodule {
  submodule_id: number;
  submodule_name: string;
  submodule_path: string;
  full_path: string;
  items: Item[];
  open_item: boolean;
}

interface Item {
  item_id: number;
  item_name: string;
  item_path: string;
  full_path: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  menu: any[] = [];

  constructor(private router: Router,private AppService: AppService) {
  }

  ngOnInit(): void {
    const storedMenu = localStorage.getItem('menu');
    if (!storedMenu) {
      this.AppService.getMenu().subscribe(
        response => {
          const modulesArray: any = Object.values(response.data);
  
          modulesArray.forEach((module: any) => {
            if (module.submodules && !Array.isArray(module.submodules)) {
              module.submodules = Object.values(module.submodules);
            }
    
            module.submodules.forEach((submodule: any) => {
              if (submodule.items && !Array.isArray(submodule.items)) {
                submodule.items = Object.values(submodule.items);
              }
            });
          });
  
          this.menu = this.buildFullPaths(modulesArray);
          localStorage.setItem('menu', JSON.stringify(this.menu));
        }
      );
    } else {
      this.menu = storedMenu ? JSON.parse(storedMenu) : [];
    }
    
  }

  esRutaActual(ruta: string): boolean {
    return this.router.isActive(ruta, false);
  }

  buildFullPaths(modules: Module[], parentPath: string = ''): Module[] {
    return modules.map(module => {
      const fullPath = `${parentPath}${module.module_path}`;
      module.full_path = fullPath;
      module.open_module = false;

      // Construir la ruta completa para cada submódulo
      if (module.submodules && module.submodules.length > 0) {
        module.submodules = this.buildFullPathsForSubmodules(module.submodules, fullPath);
      }
      return module;
    });
  }

  buildFullPathsForSubmodules(submodules: Submodule[], parentPath: string): Submodule[] {
    return submodules.map(submodule => {
      const fullPath = `${parentPath}${submodule.submodule_path}`;
      submodule.full_path = fullPath;
      submodule.open_item = false;

      // Construir la ruta completa para cada item dentro del submódulo
      if (submodule.items && submodule.items.length > 0) {
        submodule.items = this.buildFullPathsForItems(submodule.items, fullPath);
      }
      return submodule;
    });
  }

  buildFullPathsForItems(items: Item[], parentPath: string): Item[] {
    return items.map(item => {
      const fullPath = `${parentPath}${item.item_path}`;
      item.full_path = fullPath;
      return item;
    });
  }

}
