import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app-stand-alone.component.html',
})
export class AppStandAloneComponent {
  title = 'ntk-cms-web';
}
