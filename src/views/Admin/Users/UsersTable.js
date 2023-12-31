import { Flex, Table, Tbody, Th, Thead, Tr } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { CiInstagram } from "react-icons/ci";
import { useSelector } from "react-redux";
import ConfirmDialog from "../../../components/Dialog/ConfirmDialog";
import { useAdminApi } from "../../../services/fasterDriver";
import UsersRow from "./UsersRow";

const captions = [<Flex justifyContent={'center'}><CiInstagram size={24} /></Flex>, "Name", "Email", "Type", "Phone", <Flex justifyContent={'center'}>Action</Flex>];
const orderingEnabled = ['name', 'email', 'type', 'phone']
export default function UsersTable({ loading, data, updateData }) {
  const { keyword } = useSelector(state => state.ui)
  const [showSuspend, setShowSuspend] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [showApprove, setShowApprove] = useState(false)
  const [activeUser, setActiveUser] = useState(null)

  const api = useAdminApi()

  const [ordering, setOrdering] = useState({
    by: 'Name',
    type: 'asc'
  })
  const [orderedData, setOrderedData] = useState([])


  useEffect(() => {
    setOrderedData(data.sort((a, b) => {
      if (ordering.type === 'asc') {
        return a[ordering.by] > b[ordering.by] ? 1 : -1
      } else {
        return a[ordering.by] < b[ordering.by] ? 1 : -1
      }
    }))
  }, [ordering])

  useEffect(() => {
    setOrderedData(data)
  }, [data]);

  const toggleOrdering = (by) => {
    if (orderingEnabled.includes(by)) {
      setOrdering({
        by,
        type: ordering.type === 'asc' ? 'desc' : 'asc'
      })
    }
  }


  const onConfirmDelete = () => {
    api.deleteUser(activeUser.id)
      .then(({ ok }) => {
        console.log('deleteUser', ok)
        if (ok) {
          updateData()
        }
      })
      .finally(() => {
        setShowDelete(false)
      })
  }

  const onConfirmSuspend = () => {
    api.suspendUser(activeUser.id)
      .then(({ ok }) => {
        console.log('suspendUser', ok)

        if (ok) {
          updateData()
        }
      })
      .finally(() => {
        setShowSuspend(false)
      })
  }
  const onConfirmApprove = () => {
    api.approveUser(activeUser.id)
      .then(({ ok }) => {
        console.log('approvedUser:', ok);
        if (ok) {
          updateData()
        }
      })
      .finally(() => {
        setShowApprove(false)
      })
  }

  const onItemDelete = (item) => {
    setActiveUser(item)
    setShowDelete(true)
  }

  const onItemSuspend = (item) => {
    setActiveUser(item)
    setShowSuspend(true)
  }
  const onItemApprove = (item) => {
    setActiveUser(item)
    setShowApprove(true)
  }




  const filteredData = keyword ? orderedData.filter(item => {
    return item?.name?.toLowerCase().includes(keyword.toLowerCase()) || item?.email?.toLowerCase().includes(keyword.toLowerCase()) || item?.type?.toLowerCase().includes(keyword.toLowerCase())
  }) : orderedData

  return <Table variant='simple' color={'black'} w={'100%'}>
    <Thead>
      <Tr my='.8rem' pl='0px' bg={'primary.500'}>
        {captions.map((caption, idx) => {
          return (
            <Th color='white' key={idx} ps={idx === 0 ? "0px" : null} cursor={'pointer'} onClick={() => toggleOrdering(caption?.toLowerCase?.())}>
              {caption} {ordering.by === caption?.toLowerCase?.() && <span>{ordering.type === 'asc' ? '▲' : '▼'}</span>}
            </Th>
          );
        })}
      </Tr>
    </Thead>
    <Tbody>
      {loading ?
        [0, 0, 0, 0, 0].map((it, id) => <UsersRow
          name={'-'}
          photo={'-'}
          phone={'-'}
          email={'-'}
          type={'-'}
          loading={loading}
          key={id}
        />)
        :
        filteredData?.map((row, index) => {
          return (
            <UsersRow
              key={`${row.email}-${row.name}-${index}`}
              name={row.name}
              photo={row[row.type?.toLowerCase()]?.photo}
              phone={row[row.type?.toLowerCase()]?.phone}
              email={row.email}
              type={row.type}
              isActive={row.activated_profile}
              onSuspend={() => onItemSuspend(row)}
              onDelete={() => onItemDelete(row)}
              onApprove={() => onItemApprove(row)}
            />
          );
        })
      }
    </Tbody>
    <ConfirmDialog
      isOpen={showSuspend}
      title={'Suspend User'}
      message={'Are you sure you want to suspend this user?'}
      onClose={() => setShowSuspend(false)}
      onOk={onConfirmSuspend}
      captionOk={'Suspend'}
    />
    <ConfirmDialog
      isOpen={showApprove}
      title={'Approve User'}
      message={'Are you sure you want to approve this user?'}
      onClose={() => setShowApprove(false)}
      onOk={onConfirmApprove}
      captionOk={'Approve'}
      okColor={'green'}
    />
    <ConfirmDialog
      isOpen={showDelete}
      title={'Delete User'}
      message={'Are you sure you want to delete this user?'}
      onClose={() => setShowDelete(false)}
      onOk={onConfirmDelete}
      captionOk={'Delete'}
    />
  </Table>
}