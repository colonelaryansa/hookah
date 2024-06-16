import { useContext, useEffect, useState } from 'react';
import { Button, Col, Modal, Row, Space, Table } from 'antd';
import NotificationContext from '../../../Contexts/Notification';
import useGhelyoonFilters from './useGhelyoonFilters'
import { Link } from 'react-router-dom';
import './index.css'
import { deleteLocation, getAllLocations } from '../../../Services/LocationService';
import { getAllNeighbours } from '../../../Services/NeighbourService';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [locationData, setLocationData] = useState([]);
  const [neighbours, setNeighbours] = useState([]);
  const openNotification = useContext(NotificationContext)
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    }
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteModalData, setDeleteModalData] = useState(null);
  const [isDeleteButtonLoading, setIsDeleteButtonLoading] = useState(false);


  const showDeleteModal = (record) => {
    setDeleteModalData(record)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteModalOk = () => {
    setIsDeleteButtonLoading(true)
    deleteLocation(deleteModalData.id)
      .then(response => {
        if (response.statusText === 'No Content') {
          openNotification('success', 'عملیات با موفقیت انجام شد')
        } else {
          openNotification('error', 'بروز خطا')
        }
        fetchLocations()
        setIsDeleteButtonLoading(false)
        setIsDeleteModalOpen(false);
      })
      .catch(() => {
        openNotification('error', 'بروز خطا')
        fetchLocations()
        setIsDeleteButtonLoading(false)
        setIsDeleteModalOpen(false);
      })
  };

  const handleDeleteModalCancel = () => {
    setIsDeleteModalOpen(false);
  };

  // Table Filters
  const {
    columns,
    handleChange,
    handleDirection,
    clearFilters
  } = useGhelyoonFilters(
    {
      neighbours,
      setLocationData,
      tableParams,
      setTableParams,
      showDeleteModal
    }
  );

  const getLocationSearchQueryParams = () => {
    let items = {
      pageSize: tableParams.pagination?.pageSize,
      page: tableParams.pagination?.current
    }
    if (tableParams.filters) {
      const filterParams = {}
      for (const key in tableParams.filters) {
        if (Object.hasOwnProperty.call(tableParams.filters, key)) {
          let element = tableParams.filters[key];
          if (element) {
            filterParams[key] = element[0]
          }
          if (key === 'neighbour' && tableParams.filters[key]) {
            filterParams['neighbour'] = neighbours.find(n => n.title === element[0]).id
          }
        }
      }
      items['filters'] = filterParams
    }
    return items;
  };

  const fetchLocations = () => {
    getAllLocations({ params: getLocationSearchQueryParams() })
      .then(({ data }) => {
        setLoading(false);
        setLocationData(data.data)
        setTableParams({
          ...tableParams,
          pagination: {
            ...tableParams.pagination,
            total: data.meta.total,
          },
        });
      })
      .catch(() => {
        setLoading(false)
        openNotification('error', 'سرور خطا دارد 💩')
      })
  }

  useEffect(() => {
    getAllNeighbours().then(data => setNeighbours(data))
  }, [])

  useEffect(() => {
    setLoading(true);
    fetchLocations()
  }, [
    // filteredInfo,
    tableParams.pagination?.current,
    tableParams.pagination?.pageSize,
    tableParams.filters
  ])

  let isFiltered = false
  if (tableParams.filters) {
    isFiltered = Object.values(tableParams.filters).some(item => item != null)
  }
  
  return (
    <>
      <p>لیست کافه</p>
      <Row>
        <Col span={16}>
          <Space
            style={{
              marginBottom: 16,
            }}
          >
            <Button onClick={clearFilters} className={isFiltered && 'blink-button'}>
              حذف فیلتر
            </Button>
            <Button onClick={() => { handleDirection('شمال') }}>بسمت شمال</Button>
            <Button onClick={() => { handleDirection('مرکز') }}>بسمت مرکز</Button>
            <Button onClick={() => { handleDirection('غرب') }}>بسمت غرب</Button>
          </Space>
        </Col>
        <Col span={8} style={{ textAlign: 'end' }}>
          <Link to={'/location/create'}>
            <Button type="primary">ایجاد مکان</Button>
          </Link>
        </Col>
      </Row >
      <Table
        columns={columns}
        dataSource={locationData}
        onChange={handleChange}
        loading={loading}
        rowKey={record => record.id}
        pagination={tableParams.pagination}
        bordered={true}
      />
      <Modal title="حذف" open={isDeleteModalOpen} onOk={handleDeleteModalOk} onCancel={handleDeleteModalCancel} okButtonProps={{ loading: isDeleteButtonLoading }}>
        <p>نام مکان : {deleteModalData?.title} : {deleteModalData?.neighbour}</p>
        <p>آیا مطمئن هستید ؟ </p>
      </Modal>
    </>
  );
}
