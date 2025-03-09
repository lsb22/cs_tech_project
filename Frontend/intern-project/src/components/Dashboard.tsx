import { Field } from "@/components/ui/field";
import {
  Button,
  Card,
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  Fieldset,
  Grid,
  GridItem,
  Input,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import apiClient from "../../Services/api-client";

const schema = z.object({
  // for schema based form validation
  email: z.string().min(10, { message: "Enter valid email" }),
  password: z
    .string()
    .min(8, { message: "password can't be lesser than 8 characters." }),
  name: z.string().min(4, { message: "Enter valid user name" }),
  mobile: z
    .string()
    .min(12, { message: "Enter mobile number with country code" })
    .max(12, { message: "Mobile number can't be longer than 12 numbers" })
    .refine((value) => /^\d+$/.test(value.substring(3, 13)), {
      message: "Mobile number must contain only digits after country code",
    }),
});

type AgentFormData = z.infer<typeof schema>;

interface AgentData extends AgentFormData {
  _id?: string;
}

const Dashboard = () => {
  const [agents, setAgents] = useState<AgentData[]>([]);
  useEffect(() => {
    apiClient
      .get("/agent", {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      })
      .then((res) => setAgents(res.data.agents))
      .catch((err) => alert(err.response.data.message));
  }, []);
  const {
    register,
    reset,
    formState: { errors },
    handleSubmit,
  } = useForm<AgentFormData>({ resolver: zodResolver(schema) });

  const handleCreateAgent = (data: AgentFormData) => {
    const org = [...agents];
    setAgents([...agents, data]);

    apiClient
      .post("/agent", data, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      })
      .then((res) => setAgents([...agents, res.data.agent]))
      .catch((err) => {
        console.log(err);
        setAgents(org);
      });
  };

  return (
    <Grid templateAreas={`"sidepanel main"`} height="100vh" width="100vw">
      <GridItem area="sidepanel" height="100%" overflowY="scroll" width="350px">
        <Stack
          width="95%"
          gap={5}
          border="1px solid white"
          borderRadius={10}
          ml={2}
          mt={10}
          mb={5}
          p={5}
        >
          <Text ml={1} fontSize="1.2rem">
            Create agents to get started
          </Text>

          <DialogRoot
            placement="center"
            motionPreset="slide-in-bottom"
            closeOnInteractOutside={false}
            size={{ lg: "md", sm: "xs" }}
          >
            <DialogTrigger asChild>
              <Button>Create Agent</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  <Text fontWeight="700">Enter Agent details</Text>
                </DialogTitle>
              </DialogHeader>
              <DialogBody>
                <form
                  onSubmit={handleSubmit((data) => {
                    handleCreateAgent(data);
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
                      <Field label="Mobile">
                        <Input type="text" {...register("mobile")} />
                        {errors.mobile && (
                          <Text color="red.400">{errors.mobile.message}</Text>
                        )}
                      </Field>
                    </Fieldset.Content>
                    <Button type="submit" alignSelf="flex-start">
                      Submit
                    </Button>
                  </Fieldset.Root>
                </form>
              </DialogBody>
              <DialogFooter>
                <DialogActionTrigger asChild>
                  <Button>Close</Button>
                </DialogActionTrigger>
              </DialogFooter>
              <DialogCloseTrigger />
            </DialogContent>
          </DialogRoot>

          <Input
            size="md"
            type="file"
            unstyled
            border="1px solid white"
            borderRadius={4}
          />
        </Stack>
      </GridItem>
      <GridItem
        area="main"
        height="100%"
        borderLeft="1px solid gray"
        borderRadius={50}
        width="700px"
        overflowY="scroll"
      >
        {agents.length === 0 && (
          <Stack
            direction="row"
            height="100%"
            alignItems="center"
            justifyContent="center"
            fontSize="3rem"
          >
            Agents will be visible here
          </Stack>
        )}
        <SimpleGrid columns={{ sm: 2 }} p={10}>
          {agents.map((agent, index) => (
            <Card.Root key={index} width="300px" borderLeft="2px solid white">
              <Card.Header fontSize="1.6rem">
                Agent: <b>{agent.name}</b>
              </Card.Header>
              <Card.Body>
                <Stack fontSize="1.2rem">
                  <Text>Mobile: {agent.mobile}</Text>
                  <Text>Email: {agent.email}</Text>
                  <Text>Tasks</Text>
                </Stack>
              </Card.Body>
            </Card.Root>
          ))}
        </SimpleGrid>
      </GridItem>
    </Grid>
  );
};

export default Dashboard;
