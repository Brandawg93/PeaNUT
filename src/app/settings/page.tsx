'use client'

import React, { useContext, useState } from 'react'
import { Button, Card, Input, List, ListItem } from '@material-tailwind/react'
import { useTranslation } from 'react-i18next'
import { ThemeContext } from '@/client/context/theme'
import { LanguageContext } from '@/client/context/language'
import Footer from '@/client/components/footer'

export default function Settings() {
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const { theme } = useContext(ThemeContext)
  const [selected, setSelected] = useState<number>(1)

  const setSelectedItem = (value: number) => setSelected(value)
  const selectedStyle = { color: 'black' }

  return (
    <div className='flex flex-1 flex-col pl-3 pr-3'>
      <div className='flex justify-center'>
        <div className='container'>
          <h1 className='mb-4 text-2xl font-bold'>Settings</h1>
        </div>
      </div>
      <div className='flex flex-1 justify-center'>
        <div className='container flex flex-1 flex-col justify-between'>
          <div className='flex flex-row'>
            <Card className='w-96 bg-white dark:bg-gray-800'>
              <List>
                <ListItem
                  selected={selected === 1}
                  onClick={() => setSelectedItem(1)}
                  className='active: text-black dark:text-white'
                  style={selected === 1 ? selectedStyle : {}}
                >
                  Manage Servers
                </ListItem>
                <ListItem
                  selected={selected === 2}
                  onClick={() => setSelectedItem(2)}
                  className='active: text-black dark:text-white'
                  style={selected === 2 ? selectedStyle : {}}
                >
                  Influx DB v2
                </ListItem>
              </List>
            </Card>
            <div className='flex-1'>
              <form className='w-full rounded-lg bg-white p-6 dark:bg-gray-800'>
                <div className='mb-4'>
                  <Input
                    type='text'
                    variant='outlined'
                    label={t('connect.server')}
                    value={'test'}
                    onChange={() => {}}
                    className='w-full px-3 py-2'
                    color={theme === 'light' ? 'black' : 'white'}
                    data-testid='server'
                    crossOrigin=''
                  />
                </div>
                <div className='mb-6'>
                  <Input
                    type='number'
                    variant='outlined'
                    label={t('connect.port')}
                    value={0}
                    onChange={() => {}}
                    className='w-full px-3 py-2'
                    color={theme === 'light' ? 'black' : 'white'}
                    data-testid='port'
                    min={0}
                    max={65535}
                    crossOrigin=''
                  />
                </div>
                <div className='flex flex-row justify-between'>
                  <Button className='bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700' type='button'>
                    Cancel
                  </Button>
                  <Button type='submit'>{t('connect.connect')}</Button>
                </div>
              </form>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  )
}
