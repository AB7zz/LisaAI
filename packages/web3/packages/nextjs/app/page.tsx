"use client";

import Link from "next/link";
import type { NextPage } from "next";
import JobSpecification from "../components/JobSpecification";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <JobSpecification />
    </>
  );
};

export default Home;
