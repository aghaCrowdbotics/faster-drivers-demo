// Chakra imports
import { Box, Flex, useToast, Skeleton, Spinner, Table, Tbody, Td, Text, Th, Thead, Tr, useColorModeValue } from "@chakra-ui/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Card from "../../../components/Card/Card";
import CardBody from "../../../components/Card/CardBody";
import CardHeader from "../../../components/Card/CardHeader";
import ConfirmDialog from "../../../components/Dialog/ConfirmDialog";
import { useAdminApi } from "../../../services/fasterDriver";
import UsersRow from "./UsersRow";
import UsersTable from "./UsersTable";

function Users() {
  const toast = useToast();
  const textColor = useColorModeValue("gray.700", "white");
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false)
  const [maxRecordFound, setMaxRecordFound] = useState(false)
  const [userData, setUserData] = useState([])
  const api = useAdminApi();
  const totalUserFetchLimit = 100;

  useEffect(() => {
    fetchUsers()
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    api.getUsers(totalUserFetchLimit, 1)
      .then(({ ok, data }) => {
        if (ok) {
          setUserData(data);
        }
      })
      .finally(() => setLoading(false))
  }

  const fetchMoreUsers = () => {
    api.getUsers(totalUserFetchLimit, count)
      .then(({ ok, data }) => {
        if (ok) {
          if (data?.length < totalUserFetchLimit) {
            toast({
              title: 'Maximum Users Fetched',
              description: 'You have reached the maximum number of users',
              status: 'warning',
              duration: 5000
            })
            setMaxRecordFound(true);
          }
          if (data?.length >= totalUserFetchLimit) {
            let updatedusers = [];
            updatedusers = [...userData, ...data];
            setUserData(updatedusers);
          }
        }
      })
      .finally(() => setLoading(false))
  }

  const updateUsers = useCallback(() => {
    setLoading(true);
    // Fetch users using the current length of userData as the limit
    api.getUsers(userData.length, 1)
      .then(({ ok, data }) => {
        if (ok) {
          setUserData(data);
        }
      })
      .finally(() => setLoading(false));
  }, [userData.length]);

  const handleScroll = (event) => {
    const element = event.currentTarget;
    const reachedBottom = element.scrollTop > 0 && (Number(element.scrollHeight) - Number(element.scrollTop.toFixed(0)) === Number(element.clientHeight));
    if (reachedBottom && !maxRecordFound) {
      setCount(count + 1);
      fetchMoreUsers();
    }
  };

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      <Card maxHeight={'800px'} onScroll={handleScroll} overflowX={{ sm: "scroll", xl: "scroll" }}>
        <CardHeader p='6px 0px 22px 0px'>
          <Text fontSize='xl' color={textColor} fontWeight='bold'>
            Users
          </Text>
        </CardHeader>
        <CardBody w={'100%'}>
          <UsersTable data={userData} loading={loading} updateData={updateUsers} />
        </CardBody>
      </Card>
    </Flex>
  );
}

export default Users;
