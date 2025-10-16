'use client';

import axiosInstance from '@/axios/axiosInstance';
import useUserStore from '@/zustand/user';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId;
  const setUser = useUserStore((state) => state.setUser);


  const fetchCurentUser = async () => {
    try {
      const response = await axiosInstance.get(`sales-rep/get-current-user/${userId}`);

      console.log("current user response in salesresp", response)

      if (response.data.statusCode === 200) {
        setUser(response.data.data);
      }

    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchCurentUser();
      router.push('/');
    }
  }, [userId]);

  return (
    <div>
    </div>
  );
};

export default Page;