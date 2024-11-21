"use client";
import { HeaderInput } from "../HeaderInput";
import { SlEqualizer } from "react-icons/sl";
import TransactionList from "./TransactionList";
import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { allTransactions } from "@/lib/utils";
import { useGetDebitTransactions } from "@/hooks/useGetDebitTransactions";
import { useGetCreditTransactions } from "@/hooks/useGetCreditTransactions";
import { MoonLoader } from "react-spinners";
import { TbReceiptOff } from "react-icons/tb";
import TransactionHead from "./TransactionHead";

function TransactionBills({ user }) {
  const [val, setVal] = useState("");
  const [count, setCount] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { debitTransactions, status: debitStatus } = useGetDebitTransactions(
    user?.$id
  );
  const { creditTransactions, status: creditStatus } = useGetCreditTransactions(
    user?.$id
  );

  const sortArr = ["all", "withdrawal", "deposit"];
  // useEffect(
  //   function () {
  //     if (val.length) {
  //       const params = new URLSearchParams(searchParams);
  //       params.set("page", 1);
  //       router.push(`${pathname}?${params.toString()}`);
  //     }
  //   },
  //   [val, pathname, router, searchParams]
  // );

  // useEffect(
  //   function () {
  //     function handleClick() {
  //       const params = new URLSearchParams(searchParams);
  //       params.set("sortBy", sortArr[count]);
  //       router.replace(`${pathname}?${params.toString()}`);
  //     }
  //     handleClick();
  //   },
  //   [count]
  //   // [pathname, router, sortArr, count, searchParams]
  // );
  if (debitStatus === "pending" || creditStatus === "pending")
    return (
      <div>
        <TransactionHead />
        <div className="flex items-center justify-center h-[100px]">
          <MoonLoader speedMultiplier={0.5} color="#ea763d" size={30} />
        </div>
      </div>
    );
  const recentTransactions = [debitTransactions, creditTransactions];
  const arrTransact = allTransactions(recentTransactions, user);
  const transactionArr = arrTransact.map((transaction) => {
    return {
      id: transaction["$id"],
      name:
        transaction.credName === user.fullName
          ? transaction.depName
          : transaction.credName,
      amount: transaction.amount,
      status: transaction.status,
      date: transaction["$createdAt"],
      img:
        transaction.credImg === null ? transaction.depImg : transaction.credImg,
    };
  });
  if (!transactionArr.length)
    return (
      <>
        <TransactionHead />
        <div className="flex flex-col items-center justify-center h-[100px] gap-2">
          <div className="rounded-full bg-buttonOrange p-3 text-zinc-300">
            <TbReceiptOff className="text-2xl" />
          </div>
          <p className="text-sm text-zinc-400">
            You don&apos;t have any transactions
          </p>
        </div>
      </>
    );
  const sortBy = searchParams.get("sortBy") || "all";
  function handleClick() {
    setCount((c) => (count < 2 ? count + 1 : 0));
    const params = new URLSearchParams(searchParams);
    params.set("sortBy", sortArr[count]);
    router.replace(`${pathname}?${params.toString()}`);
  }
  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-base text-zinc-300">Bill & Payment</h1>
        <div className="flex gap-2 items-center">
          <HeaderInput val={val} setVal={setVal} />
          <div className="p-2 rounded-full  border border-zinc-800 ">
            <SlEqualizer
              onClick={() => handleClick()}
              className="text-lg text-zinc-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
      <Suspense
        key={sortBy}
        fallback={<p className="text-zinc-100 text-xl">load...</p>}
      >
        <TransactionList
          val={val}
          user={user}
          transactionArr={transactionArr}
        />
      </Suspense>
    </>
  );
}

export default TransactionBills;
