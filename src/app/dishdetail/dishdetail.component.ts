import { Component, OnInit,ViewChild,Inject} from '@angular/core';
import {Params,ActivatedRoute} from '@angular/router';
import {Location} from "@angular/common";
import { Dish } from '../shared/dish';
import {DishService} from '../services/dish.service';
import {switchMap } from 'rxjs/operators';
import {FormBuilder,FormGroup,Validators} from '@angular/forms';
import { stringify } from 'querystring';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {

  dish:Dish;
  errMess:string;
  dishIds: string[];
  prev:string;
  next:string;
  commentForm:FormGroup;
  comment:Comment;
  @ViewChild('cform') commentFormDirective;

  formErrors={
    'author':'',
    'comment':''
  };

  validationMessages ={
    'author':{
      'required':'First name is required',
      'minlength':'First name must be atleast 2 characters long',
      'maxlength': 'First name cannot be more than 25 characters long'
    },
    
    'comment':{
      'required':'Comment is required',
      'minlength':'Comment must be atleast 1 characters long'
    }
  };
  constructor(private dishService:DishService,
    private route:ActivatedRoute,
    private location:Location,
    private cm:FormBuilder,
    @Inject ('BaseURL') private BaseURL) {
      this.createForm();
     }

  ngOnInit() {
    this.dishService.getDishIds()
    .subscribe((dishIds)=> this.dishIds=dishIds);
    this.route.params
    .pipe(switchMap((params:Params) =>this.dishService.getDish(params['id'])))
    .subscribe(dish=>{this.dish=dish; this.setPrevNext(dish.id)},
    errmess => this.errMess =<any>errmess);
  }
  createForm()
  {
    this.commentForm=this.cm.group({
      author:['',[Validators.required,Validators.minLength(2),Validators.maxLength(25)]],
      rating:5,
      date:'',
      comment:['',[Validators.required,Validators.minLength(1)]],
    });

    this.commentForm.valueChanges
    .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); //(re)set form validation messages
  }
  onValueChanged(data? :any){
    if(!this.commentForm){return;}
    const form=this.commentForm;
    for (const field in this.formErrors){
      if(this.formErrors.hasOwnProperty(field)){
        //clear previous error messages
        this.formErrors[field]='';
        const control =form.get(field);
        if(control && control.dirty && !control.valid){
          const messages= this.validationMessages[field];
          for (const key in control.errors){
            if (control.errors.hasOwnProperty(key)){
              this.formErrors[field]+=messages[key]+' ';
            }
          }
        }
      }
    }
  }

  setPrevNext(dishId:string){
    const index=this.dishIds.indexOf(dishId);
    this.prev=this.dishIds[(this.dishIds.length + index - 1)%this.dishIds.length];
    this.next=this.dishIds[(this.dishIds.length + index + 1)%this.dishIds.length];
  }
goBack():void{
  this.location.back();
}
onSubmit(){
  this.comment=this.commentForm.value;

  this.commentForm.value.date=(new Date()).toISOString();
  
  this.dish.comments.push(this.commentForm.value);
  console.log(this.commentForm.value);
  this.commentForm.reset({
    author:'',
    rating:5,
    comment:''
  });
  this.commentFormDirective.resetForm({rating:5});
}
}
