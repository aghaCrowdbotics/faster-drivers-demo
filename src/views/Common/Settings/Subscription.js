import { Box, Button, Container, Flex, Heading, Image, Skeleton, Text, useToast } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ConfirmDialog from "../../../components/Dialog/ConfirmDialog";
import { logout } from "../../../reducers/auth";
import { useApi } from "../../../services/fasterDriver";
import logo from "../../../assets/svg/logo.svg";
import CustomerSettingsLayout from "./index";
import { useHistory, useLocation } from "react-router-dom";

export default function Subscription() {
    const { user } = useSelector(state => state.auth);
    const api = useApi();
    const history = useHistory();
    const toast = useToast();
    const [isOpen, setIsOpen] = useState(false)
    const [subscriptionPlan, setSubscriptionPlan] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const [loading, setLoading] = useState(false);

    //Checks//

    const userSubscription = user[user.type.toLowerCase()]?.subscription // get user status of subscription 
    const isSubscribed = userSubscription?.status === 'active' || false;



    const fetchSubscriptions = () => {
        setLoading(true)
        api.getSubscriptions().then((subscriptions) => {
            setSubscriptionPlan(subscriptions?.data?.data)
        }).catch((error) => { }).finally((() => {
            setLoading(false)
        }));
    }

    const handleUnSubcribe = () => {
        api.unSubscribe().then(({ ok, data }) => {
            if (ok) {
                api.fetchUserApi();
                toast({
                    title: 'Success',
                    description: data,
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                })
            }
            else {
                toast({
                    title: 'Error',
                    description: 'Something went wrong',
                    status: 'warning',
                    duration: 3000,
                    isClosable: true,
                })
            }
        }).catch((error) => {
        }).finally(() => setIsOpen(false))
    }

    useEffect(() => {
        fetchSubscriptions();
    }, [])


    return <CustomerSettingsLayout>
        <Flex direction={'column'} w={{ base: '90%', md: '60%' }} alignItems={'center'} gap={4}>
            <Image src={logo} />
            {loading ?
                <Skeleton h={150} borderRadius={10} width={'75%'} />
                :
                (subscriptionPlan && subscriptionPlan?.map((item, index) => {
                    return (
                        <Flex
                            key={index}
                            alignItems={'center'}
                            direction='column'
                            gap={8}
                            width={'75%'}
                        >
                            <Flex
                                width={'100%'}
                                cursor={'pointer'}
                                onClick={() => {
                                    setIsFocused(true)
                                }}
                                direction={'column'}
                                borderRadius={'8px'}
                                border={isFocused ? '0.2px solid blue' : '0.2px solid black'}
                                boxShadow={isFocused ? '0 0px 1.1px 0 blue, 0 0px 1.1px 0 blue' : ''}
                                boxSizing={'border-box'}>
                                <Flex
                                    padding={'15px'}
                                    borderRadius={'8px 8px 0px 0px'}
                                    color={'white'}
                                    backgroundColor={'primary.500'}
                                    direction={'row'}
                                    justifyContent={'center'}>
                                    <Text fontWeight={600}>{item.interval[0].toUpperCase() + item.interval.slice(1) + 'ly Plan'}</Text>
                                </Flex>
                                <Flex
                                    borderBottom={'0.2px solid black'}
                                    padding={'15px'}
                                    direction={'row'}
                                    color={'grey.200'}
                                    justifyContent={'center'}
                                    fontSize={12}>
                                    <Text fontWeight={300}>Premium subscription plan</Text>
                                </Flex>
                                <Flex
                                    padding={'15px'}
                                    direction={'row'}
                                    color={'grey.200'}
                                    justifyContent={'center'}>
                                    <Text fontWeight={300}>${item.amount / 100} / {item.interval}</Text>
                                </Flex>
                            </Flex>
                            {isFocused && (
                                isSubscribed ?
                                    <Button
                                        onClick={() => {
                                            setIsOpen(true)
                                        }}
                                        width={'100%'}
                                        variant={'primary'} bg={'red.500'} color={'white'} h={14} fontWeight={400}>
                                        Unsubscribe
                                    </Button> :
                                    <Button
                                        onClick={() => {
                                            history.push({
                                                pathname: '/restaurant/settings/my-wallet',
                                                state: item.id
                                            });
                                        }}
                                        width={'100%'}
                                        variant={'primary'} bg={'primary.500'} color={'white'} h={14} fontWeight={400}>
                                        Subscribe
                                    </Button>)
                            }
                        </Flex>
                    )
                }))
            }

        </Flex>
        <ConfirmDialog
            isOpen={isOpen}
            captionOk={'Unsubscribe'}
            title={'Are You Sure?'}
            message={'Are you sure you want to unsubscribe'}
            onClose={() => {
                setIsOpen(false)
            }}
            onOk={handleUnSubcribe}
        />
    </CustomerSettingsLayout >
}
