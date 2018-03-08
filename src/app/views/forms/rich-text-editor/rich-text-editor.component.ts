import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-rich-text-editor',
  templateUrl: './rich-text-editor.component.html',
  styleUrls: [
    './rich-text-editor.component.css'
  ]
})
export class RichTextEditorComponent implements OnInit {

  editorData = `<h1>LocalBeats | Angular</h1>`;

  constructor() { }

  ngOnInit() {
  }

  onContentChanged() { }
  onSelectionChanged() { }
}
