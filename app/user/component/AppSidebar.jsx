"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSidebar } from '@/app/context/SidebarContext'
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Grid2X2, UserCircle, BookOpenText, KeyRound, Trophy, ScrollText, ChevronDown,  } from "lucide-react";
const navItems = [
    {
        icon: <UserCircle />, name: "User Profile",
        subItems: [
            { name: "My Profile", path: "/user/Userprofile/profile", pro: false },
            { name: "KYC Document", path: "/user/Userprofile/viewkyc", pro: false },
        ],
    },
    {
        icon: <BookOpenText />, name: "Order Form",
        subItems: [
            { name: "New Order Form", path: "/user/OrderForm/Order/CreateOrder", pro: false },
            { name: "Cart", path: "/user/OrderForm/Order/Cart", pro: false },
            { name: "Pending Orders", path: "/user/OrderForm/pendingorder", pro: false },
            { name: "My Approved Orders", path: "/user/OrderForm/approvedorder", pro: false },
            { name: "My Delivered Orders", path: "/user/OrderForm/deliveredOrder", pro: false },
            { name: "Product List", path: "/user/OrderForm/productlist", pro: false },
        ],
    },
    {
        icon: <KeyRound />, name: "Change Password", path: "/user/ChangePassword",
    },
    {
        icon: <Trophy />, name: "Company Achievers",
        subItems: [
            { name: "Rank Achievers", path: "/user/CompanyAchivers/Rank", pro: false },
            { name: "Trip Achievers", path: "/user/CompanyAchivers/Trip", pro: false },
            { name: "Car Achievers", path: "/user/CompanyAchivers/Car", pro: false },
            { name: "Marketing Plan", path: "/user/CompanyAchivers/Marketing", pro: false },
        ],
    },
    {
        icon: <ScrollText />, name: "Public Notice",
        subItems: [
            { name: "Times of India", path: "/user/PublicNotice/TimesIndia", pro: false },
            { name: "Rashtriya Saharas", path: "/user/PublicNotice/RashtriyaSaharas", pro: false },
        ],
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
            <div className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
                <Link href="/user" className="  w-full flex  justify-center items-center">
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
                    </div>
                </nav>

            </div>
        </aside>
    );
};
export default AppSidebar;

