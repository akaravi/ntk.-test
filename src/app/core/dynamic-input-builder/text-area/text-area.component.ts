import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-input-textarea',
  templateUrl: './text-area.component.html',
  styleUrls: ['./text-area.component.scss']
})
export class TextAreaComponent implements OnInit {
  static nextId = 0;
  id = ++TextAreaComponent.nextId;
  constructor() { }
  @Input()
  set model(value: string) {
    this.privateModelDate = value;
  }
  @Output() modelChange: EventEmitter<string> = new EventEmitter<string>();
  @Input() optionRequired = false;
  @Input() optionDisabled = false;
  @Input() optionLabel = '';
  @Input() optionPlaceholder = '';

  private privateModelDate = '';
  get modelDate(): string {
    return this.privateModelDate;
  }
  set modelDate(value: string) {
    this.privateModelDate = value;
    this.modelChange.emit(value);
  }

  ngOnInit(): void {
  }


}
