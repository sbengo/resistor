import { Component, ChangeDetectionStrategy, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, Validators} from '@angular/forms';
import { FormArray, FormGroup, FormControl} from '@angular/forms';

import { ProductGroupService } from './productgroup.service';
import { ValidationService } from '../common/custom-validation/validation.service';
import { ExportServiceCfg } from '../common/dataservice/export.service';
import { ExportFileModal } from '../common/dataservice/export-file-modal';

import { ProductService } from '../product/product.service';
import { GenericModal } from '../common/custom-modal/generic-modal';
import { Observable, of, forkJoin } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import { TableListComponent } from '../common/table-list.component';
import { ProductGroupComponentConfig, TableRole, OverrideRoleActions } from './productgroup.data';

import { IMultiSelectOption, IMultiSelectSettings, IMultiSelectTexts } from '../common/multiselect-dropdown';

declare var _:any;

@Component({
  selector: 'productgroup-component',
  providers: [ProductGroupService, ProductService, ValidationService],
  templateUrl: './productgroup.component.html',
  styleUrls: ['../../css/component-styles.css']
})

export class ProductGroupComponent implements OnInit {
  @ViewChild('viewModal') public viewModal: GenericModal;
  @ViewChild('viewModalDelete') public viewModalDelete: GenericModal;
  @ViewChild('listTableComponent') public listTableComponent: TableListComponent;
  @ViewChild('exportFileModal') public exportFileModal : ExportFileModal;


  public editmode: string; //list , create, modify
  public componentList: Array<any>;
  public filter: string;
  public sampleComponentForm: any;
  public counterItems : number = null;
  public counterErrors: any = [];
  public defaultConfig : any = ProductGroupComponentConfig;
  public tableRole : any = TableRole;
  public overrideRoleActions: any = OverrideRoleActions;
  public select_product : IMultiSelectOption[] = [];
  public selectedArray : any = [];

  public data : Array<any>;
  public isRequesting : boolean;

  private builder;
  private oldID : string;


  ngOnInit() {
    this.editmode = 'list';
    this.reloadData();
  }

  constructor(public productgroupService: ProductGroupService, public productService : ProductService, public exportServiceCfg : ExportServiceCfg, builder: FormBuilder) {
    this.builder = builder;
  }

  createStaticForm() {
    this.sampleComponentForm = this.builder.group({
      ID: [this.sampleComponentForm ? this.sampleComponentForm.value.ID : '', Validators.required],
      Products: [this.sampleComponentForm ? this.sampleComponentForm.value.Products : '', Validators.required],
      Description: [this.sampleComponentForm ? this.sampleComponentForm.value.Description : '']
    });
  }

  reloadData() {
    // now it's a simple subscription to the observable
  this.productgroupService.getProductGroupItem(null)
      .subscribe(
      data => {
        this.isRequesting = false;
        this.componentList = data
        this.data = data;
        this.editmode = "list";
      },
      err => console.error(err),
      () => console.log('DONE')
      );
  }

  customActions(action : any) {
    switch (action.option) {
      case 'new' :
        this.newItem()
      break;
      case 'export' :
        this.exportItem(action.event);
      break;
      case 'view':
        this.viewItem(action.event);
      break;
      case 'edit':
        this.editSampleItem(action.event);
      break;
      case 'remove':
        this.removeItem(action.event);
      break;
      case 'tableaction':
        this.applyAction(action.event, action.data);
      break;
    }
  }


  applyAction(action : any, data? : Array<any>) : void {
    this.selectedArray = data || [];
    switch(action.action) {
       case "RemoveAllSelected": {
          this.removeAllSelectedItems(this.selectedArray);
          break;
       }
       case "ChangeProperty": {
          this.updateAllSelectedItems(this.selectedArray,action.field,action.value)
          break;
       }
       case "AppendProperty": {
         this.updateAllSelectedItems(this.selectedArray,action.field,action.value,true);
       }
       default: {
          break;
       }
    }
  }

  viewItem(id) {
    this.viewModal.parseObject(id);
  }

  exportItem(item : any) : void {
    this.exportFileModal.initExportModal(item);
  }

  removeAllSelectedItems(myArray) {
    let obsArray = [];
    this.counterItems = 0;
    this.isRequesting = true;
    for (let i in myArray) {
      console.log("Removing ",myArray[i].ID)
      this.deleteSampleItem(myArray[i].ID,true);
      obsArray.push(this.deleteSampleItem(myArray[i].ID,true));
    }
    this.genericForkJoin(obsArray);
  }

  removeItem(row) {
    let id = row.ID;
    console.log('remove', id);
    this.productgroupService.checkOnDeleteProductGroupItem(id)
      .subscribe(
        data => {
        this.viewModalDelete.parseObject(data)
      },
      err => console.error(err),
      () => { }
      );
  }
  newItem() {
    //No hidden fields, so create fixed Form
    this.getProductItem();
    this.createStaticForm();
    this.editmode = "create";
  }

  editSampleItem(row) {
    let id = row.ID;
    this.getProductItem();
    this.productgroupService.getProductGroupItemById(id)
      .subscribe(data => {
        this.sampleComponentForm = {};
        this.sampleComponentForm.value = data;
        this.oldID = data.ID
        this.createStaticForm();
        this.editmode = "modify";
      },
      err => console.error(err)
      );
 	}

  deleteSampleItem(id, recursive?) {
    if (!recursive) {
    this.productgroupService.deleteProductGroupItem(id)
      .subscribe(data => { },
      err => console.error(err),
      () => { this.viewModalDelete.hide(); this.reloadData() }
      );
    } else {
      return this.productgroupService.deleteProductGroupItem(id)
      .pipe(tap(
        (test) =>  { this.counterItems++; console.log(this.counterItems)},
        (err) => { this.counterErrors.push({'ID': id, 'error' : err})}
      ));
    }
  }

  cancelEdit() {
    this.editmode = "list";
    this.reloadData();
  }

  saveSampleItem() {
    if (this.sampleComponentForm.valid) {
      this.productgroupService.addProductGroupItem(this.sampleComponentForm.value)
        .subscribe(data => { console.log(data) },
        err => {
          console.log(err);
        },
        () => { this.editmode = "list"; this.reloadData() }
        );
    }
  }

  updateAllSelectedItems(mySelectedArray,field,value, append?) {
    let obsArray = [];
    this.counterItems = 0;
    this.isRequesting = true;
    if (!append)
    for (let component of mySelectedArray) {
      component[field] = value;
      obsArray.push(this.updateSampleItem(true,component));
    } else {
      let tmpArray = [];
      if(!Array.isArray(value)) value = value.split(',');
      for (let component of mySelectedArray) {
        //check if there is some new object to append
        let newEntries = _.differenceWith(value,component[field],_.isEqual);
        tmpArray = newEntries.concat(component[field])
        component[field] = tmpArray;
        obsArray.push(this.updateSampleItem(true,component));
      }
    }
    this.genericForkJoin(obsArray);
    //Make sync calls and wait the result
    this.counterErrors = [];
  }

  updateSampleItem(recursive?, component?) {
    if(!recursive) {
      if (this.sampleComponentForm.valid) {
        var r = true;
        if (this.sampleComponentForm.value.ID != this.oldID) {
          r = confirm("Changing ProductGroup Instance ID from " + this.oldID + " to " + this.sampleComponentForm.value.ID + ". Proceed?");
        }
        if (r == true) {
          this.productgroupService.editProductGroupItem(this.sampleComponentForm.value, this.oldID)
            .subscribe(data => { console.log(data) },
            err => console.error(err),
            () => { this.editmode = "list"; this.reloadData() }
            );
        }
      }
    } else {
      return this.productgroupService.editProductGroupItem(component, component.ID)
      .pipe(tap(
        (test) =>  { this.counterItems++ },
        (err) => { this.counterErrors.push({'ID': component['ID'], 'error' : err['_body']})}
      )
      ,catchError((err) => {
        return of({'ID': component.ID , 'error': err['_body']})
      }))
    }
  }

  genericForkJoin(obsArray: any) {
    forkJoin(obsArray)
              .subscribe(
                data => {
                  this.selectedArray = [];
                  this.reloadData()
                },
                err => console.error(err),
              );
  }

  getProductItem() {
    this.productService.getProductItem(null)
      .subscribe(
      data => {
        this.select_product = [];
        this.select_product = this.createMultiselectArray(data, 'ID','ID');
      },
      err => console.error(err),
      () => console.log('DONE')
      );
  }

  createMultiselectArray(tempArray, ID?, Name?) : any {
    let myarray = [];
    for (let entry of tempArray) {
      myarray.push({ 'id': entry[ID], 'name': entry[Name], 'extraData': entry.Description });
    }
    return myarray;
  }

}
