import { Component, OnInit } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
  FormArray,
  FormControl
} from "@angular/forms";
import { CustomValidators } from "../shared/custom.valiadators";

@Component({
  selector: "app-create-employee",
  templateUrl: "./create-employee.component.html",
  styleUrls: ["./create-employee.component.css"]
})
export class CreateEmployeeComponent implements OnInit {
  employeeForm: FormGroup;
  validationMessages = {
    fullName: {
      required: "Full Name is required.",
      minlength: "Full Name must be greater than 2 characters.",
      maxlength: "Full Name must be less than 10 characters."
    },
    email: {
      required: "Email is required.",
      emailDomain: "Email domian should be dell.com"
    },
    confirmEmail: {
      required: " Confirm Email is required.",
      emailDomain: "Email domian should be dell.com"
    },
    emailGroup: {
      emailMismatch: "Email and Confirm Email do not match."
    },
    phone: {
      required: "Phone is required."
    },
    skillName: {
      required: "Skill Name is required."
    },
    experienceInYears: {
      required: "Experience is required."
    },
    proficiency: {
      required: "Proficiency is required."
    }
  };

  formErrors = {
    fullName: "",
    email: "",
    confirmEmail: "",
    emailGroup: "",
    phone: "",
    skillName: "",
    experienceInYears: "",
    proficiency: ""
  };

  constructor(private fb: FormBuilder) {}
  ngOnInit() {
    this.employeeForm = this.fb.group({
      fullName: [
        "",
        [Validators.required, Validators.minLength(2), Validators.maxLength(10)]
      ],
      contactPreference: ["email"],
      emailGroup: this.fb.group(
        {
          email: [
            "",
            [Validators.required, CustomValidators.emailDomain("dell.com")]
          ],
          confirmEmail: ["", [Validators.required]]
        },
        { validator: matchEmails }
      ),
      phone: [''],
      skills: this.fb.array([
        this.addSkillFormGroup()
      ])
    });

    this.employeeForm.valueChanges.subscribe(data => {
      this.logValidationErrors(this.employeeForm);
    });

    this.employeeForm
      .get('contactPreference')
      .valueChanges.subscribe((data: string) => {
        this.onContactPrefernceChange(data);
      });
  }

  addSkillButtonClick(): void {
    (<FormArray>this.employeeForm.get('skills')).push(this.addSkillFormGroup());
  }

  removeSkillButtonClick(skillGroupIndex: number): void {
    (<FormArray>this.employeeForm.get('skills')).removeAt(skillGroupIndex);
  }

  addSkillFormGroup(): FormGroup {
    return this.fb.group({
        skillName: ['', Validators.required],
        experienceInYears: ['', Validators.required],
        proficiency: ['', Validators.required]
    });
  }

  onContactPrefernceChange(selectedValue: string) {
    const phoneControl = this.employeeForm.get("phone");
    if (selectedValue === "phone") {
      phoneControl.setValidators(Validators.required);
    } else {
      phoneControl.clearValidators();
    }
    phoneControl.updateValueAndValidity();
  }

  logValidationErrors(group: FormGroup = this.employeeForm): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
      this.formErrors[key] = '';
      if (
        abstractControl &&
        !abstractControl.valid &&
        (abstractControl.touched || abstractControl.dirty)
      ) {
        const messages = this.validationMessages[key];
        for (const errorKey in abstractControl.errors) {
          if (errorKey) {
            this.formErrors[key] += messages[errorKey] + ' ';
          }
        }
      }
      if (abstractControl instanceof FormGroup) {
        this.logValidationErrors(abstractControl);
      }
      if (abstractControl instanceof FormArray) {
        for (const control of abstractControl.controls) {
          if (control instanceof FormGroup) {
            this.logValidationErrors(control);
          }
        }
      }
    });
  }

  loadDataClick(): void {
    const formArray1 = this.fb.array([
      new FormControl('John', Validators.required),
      new FormControl('IT', Validators.required),
      new FormControl('Male', Validators.required)
    ]);
    console.log(formArray1.value);
  }

  onSubmit(): void {
    console.log(this.employeeForm.touched);
    console.log(this.employeeForm.value);
    console.log(this.employeeForm.controls.fullName.touched);
    console.log(this.employeeForm.get('fullName').value);
  }
}

function matchEmails(group: AbstractControl): { [key: string]: any } | null {
  const emailControl = group.get("email");
  const confirmEmailControl = group.get("confirmEmail");

  if (
    emailControl.value === confirmEmailControl.value ||
    confirmEmailControl.pristine
  ) {
    return null;
  } else {
    return { emailMismatch: true };
  }
}
