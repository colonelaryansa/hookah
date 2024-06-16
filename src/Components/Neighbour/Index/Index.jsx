import { useContext, useEffect, useRef, useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import {
  Button,
  Input,
  Space,
  Table,
  Form,
  Flex,
  Radio,
  InputNumber,
  Modal,
  Typography,
  Popconfirm,
  Select
} from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import NotificationContext from '../../../Contexts/Notification';
import './Index.css'
import { createNeighbour, deleteNeighbour, getAllNeighbours, updateNeighbour } from '../../../Services/NeighbourService';
import ValidationRuleGenerator from '../../../Utils/ValidationRuleGenerator';

export default function Index() {
  const [neighboursData, setNeighboursData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [filteredInfo, setFilteredInfo] = useState({});
  const searchInput = useRef(null);
  const [storeForm] = Form.useForm();
  const [editRowForm] = Form.useForm();
  const openNotification = useContext(NotificationContext)
  const [isDeleteButtonLoading, setIsDeleteButtonLoading] = useState(false)


  const fetchTableData = () => {
    setLoading(true);
    getAllNeighbours()
      .then(result => {
        setLoading(false);
        setNeighboursData(result)
      })
      .catch(() => {
        setLoading(false)
        openNotification('error', 'سرور خطا دارد 💩')
      })
  }
  useEffect(() => { fetchTableData() }, [])


  const onFinish = (values) => {
    setLoading(true)
    createNeighbour(values)
      .then((response) => {
        if (response.statusText === 'Created') {
          openNotification('success', 'عملیات با موفقیت انجام شد')
        } else {
          openNotification('error', ' خطا  💩')
        }
        setLoading(false)
        storeForm.resetFields();
        fetchTableData()
      })
      .catch(() => {
        openNotification('error', ' خطا  💩')
        setLoading(false)
        storeForm.resetFields();
        fetchTableData()
      })
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  const handleChange = (pagination, filters, sorter) => {
    setFilteredInfo(filters);
  }


  const clearFilters = () => {
    setFilteredInfo({});
    setSearchText('')
    setSearchedColumn('')
  };
  const clearAllFilters = () => {
    clearFilters();
  }

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`جستجو عنوان`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            جستجو
          </Button>
          <Button
            onClick={() => {
              clearFilters()
              clearAllFilters()
              handleReset(clearFilters)
            }}
            size="small"
            style={{
              width: 90,
            }}
          >
            بازنشانی
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? '#1677ff' : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: '#ffc069',
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const availableDistricts = [...new Set(neighboursData.map(neighbour => neighbour.district).sort())]
    .map(district => ({ text: district.toString(), value: district }))
  const columns = [
    {
      title: 'عنوان',
      dataIndex: 'title',
      key: 'title',
      filteredValue: filteredInfo.title || null,
      ...getColumnSearchProps('title'),
      editable: true
    },
    {
      title: 'جهت',
      dataIndex: 'direction',
      key: 'direction',
      filteredValue: filteredInfo.direction || null,
      editable: true,
      filters: [
        {
          text: 'شمال',
          value: 'شمال',
        },
        {
          text: 'غرب',
          value: 'غرب',
        },
        {
          text: 'مرکز',
          value: 'مرکز',
        },
      ],
      onFilter: (value, record) => record.direction.indexOf(value) === 0,
    },
    {
      title: 'منطقه',
      dataIndex: 'district',
      key: 'district',
      filteredValue: filteredInfo.district || null,
      editable: true,
      filters: availableDistricts,
      onFilter: (value, record) => record.district === value,
    },
    {
      title: 'عملیات',
      key: 'operation',
      render: (text, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Space size={'middle'}>
            <Typography.Link
              onClick={() => save(record.id)}
              style={{
                marginRight: 8,
              }}
            >
              ذخیره
            </Typography.Link>
            <Popconfirm title="آیا انصراف می دهید ؟" onConfirm={cancel}>
              <a>انصراف</a>
            </Popconfirm>
          </Space>
        ) : (
          <Space size={'middle'}>
            <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>
              ویرایش <EditOutlined style={{ color: 'gold', fontSize: '20px' }} />
            </Typography.Link>
            <Typography.Link disabled={editingKey !== ''} onClick={() => { showModal(text) }}>
              حذف <DeleteOutlined style={{ color: 'red', fontSize: '20px' }} />
            </Typography.Link>
          </Space>
        );
      },
    },
  ];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  const showModal = (modalData) => {
    setIsModalOpen(true)
    setModalData(modalData)
  };

  const handleOk = () => {
    setIsDeleteButtonLoading(true)
    deleteNeighbour(modalData.id)
      .then(response => {
        if (response.statusText === 'No Content') {
          openNotification('success', 'عملیات با موفقیت انجام شد')
        }
        setIsDeleteButtonLoading(false)
        setIsModalOpen(false);
        fetchTableData()
      })
      .catch(() => {
        setIsDeleteButtonLoading(false)
        openNotification('error', ' خطا  💩')
        fetchTableData()
      })
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };



  // EDIT CELL START
  const [editingKey, setEditingKey] = useState('');
  const isEditing = (record) => record.id === editingKey;
  const edit = (record) => {
    editRowForm.setFieldsValue({
      title: '',
      direction: '',
      district: '',
      ...record,
    });
    setEditingKey(record.id);
  };
  const cancel = () => {
    setEditingKey('');
  };
  const save = async (key) => {
    try {
      const row = await editRowForm.validateFields();
      updateNeighbour(key, row)
        .then((response) => {
          setEditingKey('');
          if (response.statusText === 'OK') {
            setLoading(false)
            editRowForm.resetFields();
            fetchTableData()
            openNotification('success', 'عملیات با موفقیت انجام شد')
          } else {
            openNotification('error', ' خطا  💩')
            console.log('fail')
          }
        })
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };
  const EditableCell = (props) => {
    const {
      editing,
      dataIndex,
      title,
      inputType,
      record,
      index,
      children,
      ...restProps
    } = props
    const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;
    let validationRules = ValidationRuleGenerator({ label: "", min: 1, max: 100, patternType: "persianLetter" });
    if (dataIndex === 'district') {
      return (
        <td {...restProps}>
          {editing ? (
            <Form.Item
              name={dataIndex}
              style={{
                margin: 0,
              }}
              rules={
                [
                  {
                    required: true,
                    message: "منطقه وارد کنید"
                  }
                ]
              }
            >
              <InputNumber min={1} max={22} />
            </Form.Item>

          ) : (
            children
          )
          }
        </td >
      )
    }
    if (dataIndex === 'direction') {
      return (
        <td {...restProps}>
          {editing ? (
            <Form.Item
              name={dataIndex}
              style={{
                margin: 0,
              }}
              rules={[
                {
                  required: true,
                  message: 'جهت انتخاب کنید'
                }
              ]}
            >
              <Select
                options={
                  [
                    {
                      value: "شمال"
                    },
                    {
                      value: "مرکز"
                    },
                    {
                      value: "غرب"
                    },
                  ]
                }
              />
            </Form.Item>

          ) : (
            children
          )}
        </td>
      )
    }
    if (dataIndex === 'title') {
      return (
        <td {...restProps}>
          {editing ? (
            <Form.Item
              name={dataIndex}
              hasFeedback
              validateFirst
              style={{
                margin: 0,
              }}
              rules={
                ValidationRuleGenerator({
                  label: "عنوان",
                  max: 100,
                  patternType: "persianLetter"
                })
              }
            >
              <Input />
            </Form.Item>

          ) : (
            children
          )}
        </td>
      )
    } else {
      return (
        <td {...restProps}>
          {editing ? (
            <Form.Item
              name={dataIndex}
              style={{
                margin: 0,
              }}
              rules={validationRules}
            >
              {inputNode}
            </Form.Item>
          ) : (
            children
          )}
        </td>
      );
    }
  };
  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.dataIndex === 'district' ? 'number' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });
  return (
    <>
      <div className="create-form-wrapper">
        <Form
          name="horizontal_login"
          layout="inline"
          onFinish={onFinish}
          form={storeForm}
          initialValues={
            {
              district: 1,
            }
          }
        >
          <Form.Item
            name="title"
            label="عنوان"
            hasFeedback
            validateFirst
            rules={
              ValidationRuleGenerator({
                label: "عنوان",
                max: 100,
                patternType: "persianLetter"
              })
            }
          >
            <Input placeholder="عنوان" />
          </Form.Item>
          <Form.Item
            name="direction"
            label="جهت"
            rules={[
              {
                required: true,
                message: 'جهت را انتخاب کنید',
              },
            ]}
          >
            <Flex vertical gap="middle">
              <Radio.Group >
                <Radio.Button value="شمال">شمال</Radio.Button>
                <Radio.Button value="غرب">غرب</Radio.Button>
                <Radio.Button value="مرکز">مرکز</Radio.Button>
              </Radio.Group>
            </Flex>
          </Form.Item>
          <Form.Item
            name="distirct"
          >
            <Form.Item
              label="منطقه"
              name='district'
              hasFeedback
              validateFirst
            >
              <InputNumber min={1} max={22} />
            </Form.Item>
          </Form.Item>

          <Form.Item shouldUpdate>
            {() => (
              <Button
                type="primary"
                htmlType="submit"
              >
                ذخیره
              </Button>
            )}
          </Form.Item>
        </Form>
      </div>
      <p style={{ padding: 10 }}>فهرست محلات</p>
      <Space
        style={{
          marginBottom: 16,
        }}
      >
        <Button onClick={clearFilters}>حذف فیلتر</Button>
      </Space>

      <Form form={editRowForm} component={false}>
        <Table
          onChange={handleChange}
          dataSource={neighboursData}
          loading={loading}
          bordered
          rowKey={record => record.id}
          columns={mergedColumns}
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          rowClassName="editable-row"
          pagination={{
            onChange: cancel,
          }}
        />
      </Form>
      <Modal title="حذف محله" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} okButtonProps={{ loading: isDeleteButtonLoading, danger: true }}>
        <p>نام محله : {modalData && modalData.title}</p>
        <p>آیا مطمئن هستید ؟ </p>
      </Modal>
    </>
  );
}
