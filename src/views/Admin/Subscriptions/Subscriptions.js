import { Flex, Grid, useToast, GridItem, Heading, Skeleton } from "@chakra-ui/react";
import { useEffect, useState, useCallback } from "react";
import { BiPencil } from "react-icons/bi";
import { USER_TYPES } from "../../../constants/users";
import { useAdminApi, useApi } from "../../../services/fasterDriver";
import SwitchButtons from "../../Common/SwitchButtons";
import UsersTable from "../Users/UsersTable";
import EditSubscriptionDrawer from "./EditSubscriptionDrawer";

export default function Subscriptions() {
  const toast = useToast();
  const [pending, setPending] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [maxRecordFound, setMaxRecordFound] = useState(false)
  const [count, setCount] = useState(1);


  const [data, setData] = useState({})
  const [users, setUsers] = useState([])
  const [type, setType] = useState(USER_TYPES.DRIVER)

  const adminApi = useAdminApi()
  const api = useApi()

  const activePlan = data[type.toLowerCase()]?.[0]
  const totalUserFetchLimit = 100;

  useEffect(() => {
    fetchData()
    fetchUsers(type)
  }, [type])

  const fetchData = () => {
    setPending(true)
    api.getSubscriptions()
      .then(({ data, ok }) => {
        if (ok) {
          setData(data)
        }
      })
      .finally(() => {
        setPending(false)
      })
  }

  const fetchUsers = () => {
    setLoading(true)
    adminApi.getUsersWithActiveSubscription(totalUserFetchLimit, count)
      .then(({ data, ok }) => {
        if (ok) {
          setUsers(data.filter(u => u.type === type))
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const fetchMoreUsers = () => {
    adminApi.getUsersWithActiveSubscription(totalUserFetchLimit, count)
      .then(({ data, ok }) => {
        if (ok) {
          if (data?.length < totalUserFetchLimit) {
            toast({
              title: 'Maximum Records Fetched',
              description: 'You have reached the maximum number of records',
              status: 'warning',
              duration: 5000
            })
            setMaxRecordFound(true);
          }
          if (data?.length >= totalUserFetchLimit) {
            const updatedUsers = [...users, ...data.filter(u => u.type === type)];
            setUsers(updatedUsers)
          }
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const onEdit = () => {
    setShowEdit(true)
  }

  const handleScroll = (event) => {
    const element = event.currentTarget;
    const reachedBottom = element.scrollTop > 0 && (Number(element.scrollHeight) - Number(element.scrollTop.toFixed(0)) === Number(element.clientHeight));
    if (reachedBottom && !maxRecordFound) {
      setCount(count + 1);
      fetchMoreUsers();
    }
  };

  const updateUsers = useCallback(() => {
    setLoading(true)
    adminApi.getUsersWithActiveSubscription(totalUserFetchLimit * count, 1)
      .then(({ data, ok }) => {
        if (ok) {
          setUsers(data.filter(u => u.type === type))
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [users.length]);

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }} gap={4}>
      <Flex w={'100%'} alignItems={'center'}>
        <Grid
          templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }}
          w={'100%'}
          gridGap={4}
        >
          <GridItem>
            <SwitchButtons
              options={[USER_TYPES.DRIVER, USER_TYPES.RESTAURANT]}
              option={type}
              setOption={(type) => {
                setCount(1);
                setMaxRecordFound(false)
                setType(type);
              }}
            />
          </GridItem>
          <GridItem>
            <Skeleton isLoaded={!pending}>
              <Flex
                justifyContent={'space-between'} alignItems={'center'} h={'50px'}
                bg={'gray.100'}
                borderRadius={10}
                px={4}
              >
                <Flex>
                  PREMIUM
                </Flex>
                <Flex h={'100%'} alignItems={'center'} gap={2}>
                  <Flex h={'100%'} alignItems={'center'} bg={'gray.200'} px={4} borderRadius={10}>
                    <Flex borderRight={'1px solid black'} pr={3} h={'100%'} alignItems={'center'}>$</Flex>
                    <Flex pl={3}>{activePlan?.amount / 100}/{activePlan?.interval}</Flex>
                  </Flex>
                  <Flex cursor={'pointer'} onClick={onEdit}>
                    <BiPencil style={{ color: '#0093D9' }} />
                  </Flex>
                </Flex>
              </Flex>
            </Skeleton>
          </GridItem>
        </Grid>
      </Flex>
      <Flex maxHeight={'800px'} onScroll={handleScroll} overflowX={{ sm: "scroll", xl: "scroll" }}>
        <UsersTable data={users} loading={loading} updateData={updateUsers} />
      </Flex>
      <EditSubscriptionDrawer data={activePlan} visible={showEdit} onFinish={() => {
        setShowEdit(false)
        fetchData()
      }} />
    </Flex>
  )
}
