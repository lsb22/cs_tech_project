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
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import apiClient from "../../Services/api-client";
import { useNavigate, useParams } from "react-router";

const schema = z.object({
  // for schema based form validation
  email: z.string().min(10, { message: "Enter valid email" }),
  password: z
    .string()
    .min(8, { message: "password can't be lesser than 8 characters." }),
  username: z.string().min(4, { message: "Enter valid user name" }),
  mobile: z
    .string()
    .min(12, { message: "Enter mobile number with country code" })
    .max(12, { message: "Mobile number can't be longer than 12 numbers" })
    .refine((value) => /^\d+$/.test(value.substring(3, 13)), {
      message: "Mobile number must contain only digits after country code",
    }),
  creatorAgent: z.string().min(10, { message: "Enter valid email" }),
});

type AgentFormData = z.infer<typeof schema>;

interface AgentData extends AgentFormData {
  _id?: string;
}

interface Tasks {
  FirstName: string;
  Phone: string;
  Notes: string;
  assignedTo?: string;
  createdBy?: string;
  _id?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    register,
    reset,
    formState: { errors },
    handleSubmit,
  } = useForm<AgentFormData>({ resolver: zodResolver(schema) });
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [file, setFile] = useState<File>();
  const [tasks, setTasks] = useState<Tasks[]>([]);
  const { agentEmail } = useParams();

  const sendTasksToBackend = (data: Tasks[]) => {
    apiClient
      .post("/tasks", data, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      })
      .then(() => console.log("Tasks successfully uploaded to database"))
      .catch((err) => alert(err.response.data.message));
  };

  const assignTasksToAgents = () => {
    if (tasks.length === 0 || agents.length === 0) return;

    const newTasks: Tasks[] = [];

    const updatedTasks = tasks.map((task, index) => {
      if (!task.assignedTo) {
        const agent = index % agents.length;
        const t = {
          ...task,
          assignedTo: agents[agent].username,
        };
        newTasks.push(t);
        return t;
      } else return task;
    });
    setTasks(updatedTasks);
    if (newTasks.length !== 0) sendTasksToBackend(newTasks);
  };

  useEffect(() => {
    assignTasksToAgents();
  }, [tasks.length, agents.length]);

  const taskMap = useMemo(() => {
    const map = new Map();

    if (tasks.length !== 0 && agents.length !== 0) {
      agents.forEach((agent) => {
        map.set(agent.username, []);
      });

      tasks.forEach((task) => {
        if (task.assignedTo) {
          const agent = task.assignedTo;
          const arr = map.get(agent) || [];
          map.set(agent, [...arr, task]);
        }
      });
    }

    return map;
  }, [tasks, agents]);

  const handleMessageSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (file) {
      const formData = new FormData();

      formData.append("file", file);

      formData.append("fileName", file.name);
      formData.append("fileType", file.type);

      apiClient
        .post("/file/" + agentEmail, formData, {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        })
        .then((res) => {
          console.log(res);
          setTasks((prevTasks) => [...prevTasks, ...res.data.tasks]);
        })
        .catch((err) => alert(err.response.data.message));

      setFile(undefined);
    }
  };

  const selectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleCreateAgent = (data: AgentFormData) => {
    const org = [...agents];
    setAgents([...agents, data]);

    apiClient
      .post("/agent/" + agentEmail, data, {
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    apiClient
      .get("/agent/" + agentEmail, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      })
      .then((res) => setAgents(res.data.agents))
      .catch((err) => alert(err.response.data.message));
  }, []);

  useEffect(() => {
    apiClient
      .get("/tasks/" + agentEmail, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      })
      .then((res) => setTasks(res.data.tasks))
      .catch((err) => alert(err.response.data.message));
  }, []);

  // useEffect(() => {
  // }, [taskMap]);

  return (
    <Grid templateAreas={`"sidepanel main"`} height="100vh" width="100vw">
      <GridItem area="sidepanel" overflowY="scroll" width="350px">
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
            closeOnInteractOutside={true}
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
                        <Input type="text" {...register("username")} />
                        {errors.username && (
                          <Text color="red.400">{errors.username.message}</Text>
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
                      <Field label="Creators Email">
                        <Input type="email" {...register("creatorAgent")} />
                        {errors.creatorAgent && (
                          <Text color="red.400">
                            {errors.creatorAgent.message}
                          </Text>
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

          <form onSubmit={handleMessageSubmit}>
            <Input
              size="md"
              type="file"
              onChange={selectFile}
              unstyled
              border="1px solid white"
              borderRadius={4}
              accept=".csv,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            />
            <Button type="submit" mt={2}>
              Upload file (csv/xlsx/axls)
            </Button>
          </form>
          <Button onClick={handleLogout}>Logout</Button>
        </Stack>
      </GridItem>
      <GridItem
        area="main"
        height="100%"
        borderLeft="3px solid gray"
        borderRadius={5}
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
        <SimpleGrid columns={{ sm: 2 }} p={10} gap={5}>
          {agents.map((agent, index) => (
            <Card.Root key={index} width="300px" borderLeft="2px solid white">
              <Card.Header fontSize="1.6rem">
                Agent: <b>{agent.username}</b>
              </Card.Header>
              <Card.Body>
                <Stack fontSize="1.2rem">
                  <Text>Mobile: {agent.mobile}</Text>
                  <Text>Email: {agent.email}</Text>
                  <Text>Tasks</Text>
                  {taskMap &&
                    taskMap
                      .get(agent.username)
                      ?.map((task: Tasks, index: number) => (
                        <Text key={index}>{task.Notes}</Text>
                      ))}
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
