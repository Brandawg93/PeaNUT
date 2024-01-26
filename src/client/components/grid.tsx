import { useState, useMemo, useContext, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, Typography, IconButton, Tooltip } from '@material-tailwind/react'
import { useTranslation } from 'react-i18next'
import { CheckCircleIcon, PencilSquareIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import { ToastContainer, toast } from 'react-toastify'

import { LanguageContext } from '@/client/context/language'
import { ThemeContext } from '@/client/context/theme'
import { DEVICE, VARS } from '@/common/types'
import { getAllVarDescriptions, saveVar } from '@/app/actions'

type TableProps = {
  key: string
  value: string | number
}

type Props = {
  data: DEVICE
}

export default function NutGrid(props: Props) {
  const { data } = props
  const lng = useContext<string>(LanguageContext)
  const { theme } = useContext(ThemeContext)
  const { t } = useTranslation(lng)
  const [edit, setEdit] = useState<number>(-1)
  const ref = useRef<any>(null)
  const { data: descriptions } = useQuery({
    queryKey: ['deviceDescriptions'],
    queryFn: () => getAllVarDescriptions(data.name, Object.keys(data.vars)),
  })

  const anyRW = data.rwVars?.length > 0

  let result = useMemo<Array<TableProps>>(() => [], [])
  result = Object.entries(data.vars).map(([k, v]) => ({ key: k, value: v?.value || 'N/A' }))
  result.shift()

  if (!data) {
    return null
  }

  const handleEdit = (index: number) => {
    setEdit(index)
  }

  const handleClose = () => {
    setEdit(-1)
  }

  const handleSave = async (key: string) => {
    try {
      const res = await saveVar(data.name, key, ref.current.value)
      if (res?.error) {
        toast.error(res.error)
        return
      }
      if (ref.current) data.vars[key].value = ref.current.value
      handleClose()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const editinput = (key: string, value: string) => (
    <>
      <div className='flex'>
        <input
          ref={ref}
          type={!Number.isNaN(parseFloat(value)) ? 'number' : 'text'}
          className='w-full flex-grow rounded border border-gray-300 bg-transparent pl-2 text-gray-800 dark:border-gray-800 dark:text-gray-100'
          defaultValue={value}
        />
        <IconButton onClick={async () => await handleSave(key)} variant='text'>
          <CheckCircleIcon className='h-6 w-6 text-green-500' />
        </IconButton>
        <IconButton variant='text' onClick={() => handleClose()}>
          <XCircleIcon className='h-6 w-6 text-red-500' />
        </IconButton>
      </div>
    </>
  )

  return (
    <Card
      className='border-neutral-300 w-full overflow-scroll border border-solid border-gray-300 shadow-none dark:border-gray-800 dark:bg-gray-950'
      data-testid='grid'
    >
      <ToastContainer theme={theme === 'dark' || theme === 'system' ? 'dark' : 'light'} />
      <table className='w-full min-w-max table-auto text-left'>
        <thead>
          <tr className='grid-row'>
            {Object.keys(result[0]).map((head: string) => {
              return (
                <th
                  key={head}
                  className={`border-neutral-300 border-b border-r bg-gray-400 p-3 dark:border-gray-600 dark:bg-gray-700`}
                >
                  <Typography className='mb-0 text-lg font-semibold text-black dark:text-white'>
                    {t(`grid.${head}`)}
                  </Typography>
                </th>
              )
            })}
            {anyRW ? (
              <th className='border-neutral-300 w-[65px] border-b bg-gray-400 p-3 dark:border-gray-600 dark:bg-gray-700'>
                <Typography className='mb-0 text-lg font-semibold text-black dark:text-white'>&nbsp;</Typography>
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {result.map(({ key, value }, index: number) => {
            const isLast = index === result.length - 1
            const lastClass = isLast ? '' : 'border-b dark:border-gray-800'
            const isRW = data.rwVars.includes(key as keyof VARS)
            return (
              <tr key={key} aria-rowindex={index} className='grid-row'>
                <td className={`p-3 ${lastClass} border-neutral-300 w-1/2 border-r dark:border-gray-800`}>
                  <div className='flex justify-between'>
                    <Typography className='mb-0 inline font-normal dark:text-white'>{key}</Typography>
                    <Tooltip
                      className='border border-gray-400 bg-gray-300 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100'
                      content={
                        <Typography>
                          {(descriptions?.data && descriptions.data[key]) || 'Descripion Unavailable'}
                        </Typography>
                      }
                      placement='right'
                    >
                      <InformationCircleIcon className='mt-1 inline h-4 w-4' />
                    </Tooltip>
                  </div>
                </td>
                <td className={`p-3 ${lastClass} border-neutral-300 border-r dark:border-gray-800`}>
                  {edit === index ? (
                    editinput(key, value.toString())
                  ) : (
                    <Typography className='mb-0 font-normal dark:text-white'>{value || ' '}</Typography>
                  )}
                </td>
                {anyRW ? (
                  <td className={`p-3 ${lastClass} border-neutral-300 w-[65px]`}>
                    <Typography className='mb-0 font-normal dark:text-white'>
                      {isRW ? (
                        <IconButton
                          disabled={edit === index}
                          onClick={() => handleEdit(index)}
                          variant='filled'
                          className='bg-gray-100 shadow-none dark:border-gray-500 dark:bg-gray-800 dark:text-gray-100'
                        >
                          <PencilSquareIcon className='h-4 w-4 text-gray-800 dark:text-gray-100' />
                        </IconButton>
                      ) : null}
                    </Typography>
                  </td>
                ) : null}
              </tr>
            )
          })}
        </tbody>
      </table>
    </Card>
  )
}
