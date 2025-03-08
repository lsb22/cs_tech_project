import { Fieldset, Stack, Input, Button, Box, Text } from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  // for schema based form validation
  email: z.string().min(10, { message: "Enter valid email" }),
  password: z
    .string()
    .min(8, { message: "password can't be lesser than 8 characters." }),
});

type LoginData = z.infer<typeof schema>;

export default function Login() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginData>({ resolver: zodResolver(schema) });

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
        onSubmit={handleSubmit((data) => {
          console.log(data);
          reset();
        })}
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
              <Input type="email" {...register("email")} />
              {errors.email && (
                <Text color="red.400">{errors.email.message}</Text>
              )}
            </Field>
            <Field label="Password">
              <Input type="password" {...register("password")} />
              {errors.password && (
                <Text color="red.400">{errors.password.message}</Text>
              )}
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
