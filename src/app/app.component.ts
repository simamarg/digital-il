import { Component, OnInit } from '@angular/core';
import { TablesService } from './tables.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title: string = 'app';
  files: any[] = [];
  sheets: any[] = [];
  showLoginButton: boolean = true;
  inputText: string;

  constructor(private tableService: TablesService) { }

  ngOnInit() {
    this.showLoginButton = true;
    this.tableService.getFiles().subscribe(data => {
      this.files = data;
      console.log(this.files);
      this.showLoginButton = false;
    });
  }

  getSheets() {
    console.log(this.inputText);
    this.tableService.getTables(this.inputText).subscribe(data => {
      this.sheets = data;
      console.log(this.sheets);
    })
  }
}
