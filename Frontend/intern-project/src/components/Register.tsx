import { Fieldset, Stack, Input, Button, Box, Text } from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import apiClient from "../../Services/api-client";
import { useNavigate } from "react-router";

const schema = z.object({
  // for schema based form validation
  email: z.string().min(10, { message: "Enter valid email" }),
  password: z
    .string()
    .min(8, { message: "password can't be lesser than 8 characters." }),
  name: z.string().min(4, { message: "Enter valid user name" }),
});

type RegisterData = z.infer<typeof schema>;

export default function Register() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterData>({ resolver: zodResolver(schema) });

  const navigate = useNavigate();

  const handleRegister = (data: RegisterData) => {
    apiClient
      .post("/register", data)
      .then(() => navigate("/"))
      .catch((err) => alert(err.response.data.message));
  };
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
          handleRegister(data);
          reset();
        })}
      >
        <Fieldset.Root>
          <Stack>
            <Fieldset.Legend fontSize="2xl">Register</Fieldset.Legend>
            <Fieldset.HelperText>
              Please enter your details below.
            </Fieldset.HelperText>
          </Stack>
          <Fieldset.Content>
            <Field label="Name">
              <Input type="text" {...register("name")} />
              {errors.name && (
                <Text color="red.400">{errors.name.message}</Text>
              )}
            </Field>
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
