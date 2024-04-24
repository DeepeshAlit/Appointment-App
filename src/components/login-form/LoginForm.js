import React, { useState } from "react";
import notify from "devextreme/ui/notify";
import { useAuth } from "../../contexts/auth";
import Validator, { RequiredRule, EmailRule } from "devextreme-react/validator";
import "./LoginForm.scss";
import { Button, TextBox } from "devextreme-react";

export default function LoginForm() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();

  const onSubmit = async (e) => {
    e.preventDefault();
    const result = await signIn(email, password);
    if (!result.isOk) {
      notify(result.message, "error", 2000);
    }
  };

  return (
    <form className={"login-form"} onSubmit={onSubmit}>
      <div className="d-flex flex-column gap-3">
        <TextBox
          label="Email"
          labelMode="floating"
          mode="email"
          value={email}
          onValueChange={(e) => {
            setEmail(e);
          }}
        >
          <Validator>
            <RequiredRule message="Email is required" />
            <EmailRule message="Email is invalid" />
          </Validator>
        </TextBox>

        <TextBox
          label="Password"
          labelMode="floating"
          mode="password"
          value={password}
          onValueChange={(e) => {
            setPassword(e);
          }}
        >
          <Validator>
            <RequiredRule message="Password is required" />
          </Validator>
        </TextBox>

        <Button width={"100%"} useSubmitBehavior={true} type="default">
          SignIn
        </Button>
      </div>
    </form>
  );
}
