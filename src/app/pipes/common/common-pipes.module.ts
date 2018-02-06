import { NgModule } from '@angular/core';
import { RelativeTimePipe } from './relative-time.pipe';
import { ExcerptPipe } from './excerpt.pipe';
import { CapitalizePipe } from './capitalize.pipe';
@NgModule({
  declarations: [
    RelativeTimePipe,
    ExcerptPipe,
    CapitalizePipe
  ],
  exports: [
    RelativeTimePipe,
    ExcerptPipe,
    CapitalizePipe
  ]
})
export class CommonPipesModule { }