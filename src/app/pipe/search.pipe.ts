import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search',
})
export class SearchPipe implements PipeTransform {
  transform(value: any, args: string): any {    
    if (!args) {
      return value;
    } else {
      args = args.toLocaleLowerCase();
    }
    return value.filter((item:any) => {
      return item.lastName.toLocaleLowerCase().includes(args)||item.firstName.toLocaleLowerCase().includes(args);
    });
  }
}
