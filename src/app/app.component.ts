import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RestApiService } from './services/rest-api.service';
import { ConfirmationService, PrimeNGConfig } from 'primeng/api';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as Payment from 'payment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'ipg-merchant-config';
  authToken: any;
  isLoading!: boolean;
  orderResponse: any;
  ipgForm!: FormGroup;
  @ViewChild('form') form!: ElementRef;


  constructor(private _service: RestApiService,
    private primengConfig: PrimeNGConfig,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService) {

  }

  ngOnInit(): void {
    this.primengConfig.ripple = true;
    this.initForm();
    this._service.getApiManagerToken().subscribe(res => {
      this.authToken = res.access_token;
      localStorage.setItem('apiManager-token', 'Bearer ' + this.authToken);
      console.log(this.authToken);
      this.getSavedCards();
    })
  }

  private getSavedCards() {
    const orgId = '094020d0-c527-4775-bb6c-147146938a3e';
    const customerId = '9d7c931f-5215-47ae-a1a8-cfd5d6b175b6';
    this._service.getSavedCards(customerId, orgId)
      .subscribe(response => {
        console.log(response)
      })
  }

  private initForm() {
    this.ipgForm = this.fb.group({
      cardNumber: [{ value: '' }, [Validators.required, this.creditCardNumberValidator]],
      expireDate: ['', [Validators.required,this.creditCardDateValidator]],
      cvvNumber: ['', [Validators.required, this.creditCardCVVValidator]],
      cardHolderFName: ['John', [Validators.required]],
      currency: ['EUR', [Validators.required]],
      cardHolderLName: ['Doe', [Validators.required]],
      amount: ['', [Validators.required]],
    });
  }

  creditCardNumberValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (!Payment.fns.validateCardNumber(control.value)) {
      return { 'creditCardNumber': true };
    }
    return null;
  }
  creditCardDateValidator(control: AbstractControl): { [key: string]: boolean } | null {
    let expireDate = control.value;
    if (expireDate) {
      let month: string = (expireDate.getMonth() + 1).toString();
      let year: string = expireDate.getFullYear().toString() + '';
      if (!Payment.fns.validateCardExpiry(month, year)) {
        return { 'creditCardExpireDate': true };
      }
    }
    return null;
  }
  creditCardCVVValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (!Payment.fns.validateCardCVC(control.value)) {
      return { 'cvvNumber': true };
    }
    return null;
  }

  get isFormValid() {
    return this.ipgForm.invalid ? false : true;
  }


  // public onCreateOrder() {
  //   console.log(this.ipgForm.value.amount)
  // }


  public onCreateOrder() {
    this.isLoading = true;
    const payload = {
      "organizationId": "094020d0-c527-4775-bb6c-147146938a3e",
      "amount": {
        "balanceType": [
          "current"
        ],
        "name": "EUR",
        "value": +this.ipgForm.value.amount,
        "ownerId": "string"
      },
      "sourceId": "dd35508b-7529-49b8-ae56-fafd523f953f",
      "destinationId": "dd35508b-7529-49b8-ae56-fafd523f953f",
      "orderType": "deposit",
      "status": "created",
      "shipping": {
        "country": "UK",
        "city": "Aston",
        "state": "NA",
        "postcode": "CH5 3LJ",
        "street1": "19 Scrimshire Lane"
      },
      "customer": {
        "telnocc": "",
        "phone": "",
        "email": "",
        "givenName": this.ipgForm.value.cardHolderFName,
        "surname": this.ipgForm.value.cardHolderLName,
        "ip": "217.145.92.11"
      },
      "card": {
        "number": this.ipgForm.value.toString().replace(/\s/g, ""),
        "expiryMonth": "12",
        "expiryYear": "2022",
        "cvv":  this.ipgForm.value.cvvNumber
      },
      "complete": true,
      "createdBy": " ",
      "paymentBrand": "VISA",
      "paymentMode": "CC",
      "saveBeneficiary": true,
      "paymentType": "3D_SECURE",
      "isBankTransfer": false,
      "customerId": "9d7c931f-5215-47ae-a1a8-cfd5d6b175b6",
      "merchantRedirectUrl": "https://beta-wallet-business.7exchange.io/"
    }

    console.log(payload)
    // this._service.createOrder('f75e0576-a2e7-42da-9937-31ade2e389fc', payload)
    //   .subscribe(response => {
    //     this.isLoading = false;
    //     this.orderResponse = response.value.paymentDetail.data.redirect;
    //     console.log( this.orderResponse);
    //     this.showConfirmation();
    //   })
  }

  public onCancel() {
    this.showConfirmation();
  }

  private showConfirmation() {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to proceed?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.form.nativeElement.submit();
        console.log('Tes')
      }
    });
  }
}
