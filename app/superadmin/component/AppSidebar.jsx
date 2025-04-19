"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSidebar } from '@/app/context/SidebarContext'
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Grid2X2, TrophyIcon, ListCheck, UserCircle, ImageIcon, UsersRound, Medal, FileUser, BookOpenText, NotebookText, KeyRound, MailPlus, Trophy, ScrollText, ChevronDown } from "lucide-react";
const navItems = [
    {
        icon: <Grid2X2 />,
        name: "Dashboard",
        path: "/superadmin/Dashboard",
    },
    {
        icon: <ListCheck />,
        name: "Orders",
        subItems: [
            { name: "Approved", path: "/superadmin/order/approvedorder", pro: false },
            { name: "Pending", path: "/superadmin/order/pendingdorder", pro: false },
        ],
    },
    {
        icon: <UserCircle />,
        name: "User Profile",
        subItems: [
            { name: "All User", path: "/superadmin/Userprofile/user", pro: false },
        ],
    },
    {
        icon: <ListCheck />,
        name: "Payment",
        subItems: [
            { name: "Payment Ledger", path: "/superadmin/Payment", pro: false },
        ],
    },
    {
        icon: <UsersRound />,
        name: "Genealogy",
        subItems: [
            { name: "Sales Team", path: "/superadmin/Genealogy/salesteam", pro: false },
            { name: "Direct DS Code", path: "/superadmin/Genealogy/directds", pro: false },
        ],
    },
    {
        icon: <Trophy />,
        name: "Level",
        subItems: [
            { name: "Add Level", path: "/superadmin/Level/add", pro: false },
            { name: "All Level", path: "/superadmin/Level/all", pro: false },
        ],
    },

    {
        icon: <Medal />,
        name: "Bonanza",
        subItems: [
            { name: "3 Months Bonanza", path: "/superadmin/Bonanza/3MonthsBonanza", pro: false },
            { name: "Add Bonanza", path: "/superadmin/Bonanza/add", pro: false },
            { name: "Bonanza List", path: "/superadmin/Bonanza/all", pro: false },
        ],
    },
    {
        icon: <BookOpenText />,
        name: "Product Form",
        subItems: [
            { name: "Product Group", path: "/superadmin/Product/productgroup", pro: false },
            { name: "Add Product", path: "/superadmin/Product/addproduct", pro: false },
            { name: "All Product", path: "/superadmin/Product/allproduct", pro: false },
        ],
    },

    {
        icon: <TrophyIcon />,
        name: "Achivers",
        subItems: [
            { name: "Add Achivers", path: "/superadmin/Achivers/add", pro: false },
            { name: "All Achivers", path: "/superadmin/Achivers/all", pro: false },
        ],
    },

    {
        icon: <ImageIcon />,
        name: "Dashboard Image",
        path: "/superadmin/dashboardimage",
    },

    {
        icon: <KeyRound />,
        name: "Change Password",
        path: "/superadmin/ChangePassword",
    },

];

const AppSidebar = () => {
    const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
    const pathname = usePathname();

    const renderMenuItems = (navItems, menuType) => (
        <ul className="flex flex-col gap-4">
            {navItems.map((nav, index) => (
                <li key={nav.name}>
                    {nav.subItems ? (
                        <>
                            <button
                                onClick={() => {
                                    if (isExpanded || isHovered) {
                                        handleSubmenuToggle(index, menuType);
                                    }
                                }}
                                className={`menu-item group ${openSubmenu?.type === menuType && openSubmenu?.index === index
                                    ? "menu-item-active"
                                    : "menu-item-inactive"
                                    } cursor-pointer ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
                                    }`}
                            >
                                <span
                                    className={`${openSubmenu?.type === menuType && openSubmenu?.index === index
                                        ? "menu-item-icon-active"
                                        : "menu-item-icon-inactive"
                                        }`}
                                >
                                    {nav.icon}
                                </span>
                                {(isExpanded || isHovered || isMobileOpen) && (
                                    <span className="menu-item-text">{nav.name}</span>
                                )}
                                {(isExpanded || isHovered || isMobileOpen) && (
                                    <ChevronDown
                                        className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.type === menuType &&
                                            openSubmenu?.index === index
                                            ? "rotate-180 text-brand-500"
                                            : ""
                                            }`}
                                    />
                                )}
                            </button>
                            {(isExpanded || isHovered) && (
                                <div
                                    ref={(el) => (subMenuRefs.current[`${menuType}-${index}`] = el)}
                                    className={`overflow-hidden transition-all duration-300 ease-in-out
                                   ${openSubmenu?.type === menuType && openSubmenu?.index === index
                                            ? "max-h-[500px] opacity-100"
                                            : "max-h-0 opacity-0"
                                        }`}
                                >
                                    <ul className="ml-5 border-l pl-4 mt-2 space-y-2">
                                        {nav.subItems.map((sub) => (
                                            <li key={sub.path}>
                                                <Link
                                                    href={sub.path}
                                                    className={`block py-2 text-sm transition-all duration-200 
                                                   ${isActive(sub.path) ? "text-brand-500 font-semibold" : "text-gray-700 dark:text-gray-300"}`}
                                                >
                                                    {sub.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </>

                    ) : (
                        nav.path && (
                            <Link
                                href={nav.path}
                                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"}`}
                            >
                                <span className={`${isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
                                    {nav.icon}
                                </span>
                                {(isExpanded || isHovered || isMobileOpen) && (
                                    <span className="menu-item-text">{nav.name}</span>
                                )}
                            </Link>
                        )
                    )}
                </li>
            ))}
        </ul>
    );

    const [openSubmenu, setOpenSubmenu] = useState(null);
    const [subMenuHeight, setSubMenuHeight] = useState({});
    const subMenuRefs = useRef({});

    const isActive = useCallback((path) => path === pathname, [pathname]);


    useEffect(() => {
        if (openSubmenu !== null) {
            const key = `${openSubmenu.type}-${openSubmenu.index}`;
            if (subMenuRefs.current[key]) {
                setSubMenuHeight((prevHeights) => {
                    const newHeight = subMenuRefs.current[key]?.scrollHeight || 0;
                    console.log("Submenu Height:", newHeight);  // Add this log
                    return { ...prevHeights, [key]: newHeight };
                });
            }
        }
    }, [openSubmenu]);

    const handleSubmenuToggle = (index, menuType) => {
        setOpenSubmenu((prev) =>
            prev?.type === menuType && prev?.index === index ? null : { type: menuType, index }
        );
    };

    return (
        <aside
            className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 ${isExpanded || isMobileOpen
                ? "w-[290px]"
                : isHovered
                    ? "w-[290px]"
                    : "w-[90px]"
                } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
            onMouseEnter={() => !isExpanded && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`py-4 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
                <Link href="/superadmin">
                    {isExpanded || isHovered || isMobileOpen ? (
                        <>
                            <div className="hidden lg:block"> <Image src="/images/logo/logo-blank.png" alt="Logo" width={80} height={80} /></div>
                        </>
                    ) : (
                        <Image src="/images/logo/logo-blank.png" alt="Logo" width={80} height={80} />
                    )}
                </Link>
            </div>
            <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
                <nav className="mb-6">
                    <div className="flex flex-col gap-4">
                        <div>
                            <h2 className="mb-4 text-xs uppercase flex leading-[20px] text-gray-400">Menu</h2>
                            {renderMenuItems(navItems, "main")}
                        </div>
                        {/* <div>
                            <h2 className="mb-4 text-xs uppercase flex leading-[20px] text-gray-400">Others</h2>
                            {renderMenuItems(othersItems, "others")}
                        </div> */}
                    </div>
                </nav>

            </div>
        </aside>
    );
};

export default AppSidebar;

