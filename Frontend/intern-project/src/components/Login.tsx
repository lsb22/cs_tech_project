import { Fieldset, Stack, Input, Button, Box } from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import { FormEvent } from "react";

export default function Login() {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="100vw"
      height="100vh"
    >
      <form
        className="login-form"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          console.log("submitted");
        }}
      >
        <Fieldset.Root>
          <Stack>
            <Fieldset.Legend fontSize="2xl">Login</Fieldset.Legend>
            <Fieldset.HelperText>
              Please enter your details below.
            </Fieldset.HelperText>
          </Stack>
          <Fieldset.Content>
            <Field label="Email Address">
              <Input name="email" type="email" />
            </Field>
            <Field label="Password">
              <Input name="password" type="password" />
            </Field>
          </Fieldset.Content>
          <Button type="submit" alignSelf="flex-start">
            Submit
          </Button>
        </Fieldset.Root>
      </form>
    </Box>
  );
}
