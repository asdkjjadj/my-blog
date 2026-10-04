/* ==================================================
   Windows XP Desktop
   ================================================== */


/* ==================================================
   基础元素
   ================================================== */

const desktop = document.querySelector(".desktop");

const desktopIcons = Array.from(
    document.querySelectorAll(".desktop-icon")
);

const windows = Array.from(
    document.querySelectorAll(".window")
);

const taskbarWindows = document.querySelector(
    ".taskbar-windows"
);

const clock = document.querySelector(".clock");


/* ==================================================
   Grid
   ================================================== */

/*
 * 桌面隐藏网格大小
 *
 * 数值越大：
 * 图标之间距离越远
 */

const GRID_WIDTH = 80;
const GRID_HEIGHT = 80;


/*
 * 第一个网格的位置
 */

const GRID_OFFSET_X = 0;
const GRID_OFFSET_Y = 0;


/* ==================================================
   Taskbar
   ================================================== */

/*
 * Taskbar 占桌面高度的百分比
 */

const TASKBAR_HEIGHT_PERCENT = 6;


/*
 * 获取当前 Taskbar 实际高度
 */

function getTaskbarHeight() {

    return desktop.clientHeight *
        (TASKBAR_HEIGHT_PERCENT / 100);

}


/* ==================================================
   Desktop Drag State
   ================================================== */

let draggedIcon = null;

let draggedPointerId = null;

let isDragging = false;

let dragOffsetX = 0;

let dragOffsetY = 0;


/* ==================================================
   Window Drag State
   ================================================== */

let draggedWindow = null;

let draggedWindowPointerId = null;

let isWindowDragging = false;

let windowDragOffsetX = 0;

let windowDragOffsetY = 0;


/* ==================================================
   Z-Index
   ================================================== */

let highestZIndex = 100;


/* ==================================================
   初始化桌面图标
   ================================================== */

desktopIcons.forEach((icon, index) => {

    const x =
        GRID_OFFSET_X;

    const y =
        GRID_OFFSET_Y +
        index * GRID_HEIGHT;


    icon.style.left =
        `${x}px`;


    icon.style.top =
        `${y}px`;

});


/* ==================================================
   Window Z-Index
   ================================================== */

function bringWindowToFront(windowElement) {

    highestZIndex++;

    windowElement.style.zIndex =
        highestZIndex;


    document
        .querySelectorAll(".taskbar-window")
        .forEach(button => {

            button.classList.remove(
                "active"
            );

        });


    const taskbarButton =
        document.querySelector(
            `[data-taskbar-window="${windowElement.id}"]`
        );


    if (taskbarButton) {

        taskbarButton.classList.add(
            "active"
        );

    }

}


/* ==================================================
   获取窗口图标
   ================================================== */

function getWindowIcon(windowElement) {

    return windowElement.dataset.icon || "";

}


/* ==================================================
   创建 Taskbar Button
   ================================================== */

function createTaskbarButton(windowElement) {

    const id =
        windowElement.id;


    const existing =
        document.querySelector(
            `[data-taskbar-window="${id}"]`
        );


    if (existing) {

        return existing;

    }


    const button =
        document.createElement("button");


    button.className =
        "taskbar-window";


    button.dataset.taskbarWindow =
        id;


    /* ==================================================
       Taskbar 图标
       ================================================== */

    const iconWrapper =
        document.createElement("span");


    iconWrapper.className =
        "taskbar-window-icon";


    const icon =
        document.createElement("img");


    icon.src =
        getWindowIcon(windowElement);


    icon.alt = "";

    icon.draggable = false;


    iconWrapper.appendChild(
        icon
    );


    /* ==================================================
       Taskbar 标题
       ================================================== */

    const titleWrapper =
        document.createElement("span");


    titleWrapper.className =
        "taskbar-window-title";


    const title =
        windowElement.querySelector(
            ".window-title-text"
        );


    titleWrapper.textContent =
        title
            ? title.textContent.trim()
            : windowElement.dataset.title || id;


    /* ==================================================
       组合
       ================================================== */

    button.appendChild(
        iconWrapper
    );


    button.appendChild(
        titleWrapper
    );


    /* ==================================================
       Taskbar 点击
       ================================================== */

    button.addEventListener(
        "click",
        () => {

            const isHidden =
                windowElement.style.display ===
                "none";


            const isMinimized =
                windowElement.dataset.minimized ===
                "true";


            /*
             * 当前窗口已经显示并且处于激活状态
             *
             * 再点击一次：
             * 最小化
             */

            if (
                !isHidden &&
                !isMinimized &&
                button.classList.contains("active")
            ) {

                minimizeWindow(
                    windowElement
                );

                return;

            }


            /*
             * 否则恢复窗口
             */

            restoreWindow(
                windowElement
            );

        }
    );


    taskbarWindows.appendChild(
        button
    );


    return button;

}


/* ==================================================
   删除 Taskbar Button
   ================================================== */

function removeTaskbarButton(windowElement) {

    const button =
        document.querySelector(
            `[data-taskbar-window="${windowElement.id}"]`
        );


    if (button) {

        button.remove();

    }

}


/* ==================================================
   打开窗口
   ================================================== */

function openWindow(windowElement) {

    if (!windowElement) {

        return;

    }


    windowElement.style.display =
        "block";


    windowElement.dataset.minimized =
        "false";


    /*
     * 第一次打开时设置初始位置
     */

    if (
        !windowElement.dataset.positioned
    ) {

        const desktopRect =
            desktop.getBoundingClientRect();


        const windowWidth =
            windowElement.offsetWidth;


        const windowHeight =
            windowElement.offsetHeight;


        const index =
            windows.indexOf(
                windowElement
            );


        const offset =
            index * 25;


        const taskbarHeight =
            getTaskbarHeight();


        const x =
            Math.max(
                40,
                (desktopRect.width -
                    windowWidth) / 2 +
                    offset
            );


        const y =
            Math.max(
                0,
                (desktopRect.height -
                    taskbarHeight -
                    windowHeight) / 2 +
                    offset
            );


        windowElement.style.left =
            `${x}px`;


        windowElement.style.top =
            `${y}px`;


        windowElement.dataset.positioned =
            "true";

    }


    createTaskbarButton(
        windowElement
    );


    bringWindowToFront(
        windowElement
    );

}


/* ==================================================
   最小化
   ================================================== */

function minimizeWindow(windowElement) {

    windowElement.style.display =
        "none";


    windowElement.dataset.minimized =
        "true";


    const button =
        document.querySelector(
            `[data-taskbar-window="${windowElement.id}"]`
        );


    if (button) {

        button.classList.remove(
            "active"
        );

    }

}


/* ==================================================
   恢复窗口
   ================================================== */

function restoreWindow(windowElement) {

    windowElement.style.display =
        "block";


    windowElement.dataset.minimized =
        "false";


    createTaskbarButton(
        windowElement
    );


    bringWindowToFront(
        windowElement
    );

}


/* ==================================================
   关闭窗口
   ================================================== */

function closeWindow(windowElement) {

    windowElement.style.display =
        "none";


    windowElement.dataset.minimized =
        "false";


    removeTaskbarButton(
        windowElement
    );

}


/* ==================================================
   最大化 / 恢复
   ================================================== */

function maximizeWindow(windowElement) {

    /*
     * 已经最大化
     * -> 恢复
     */

    if (
        windowElement.dataset.maximized ===
        "true"
    ) {

        windowElement.style.left =
            windowElement.dataset.oldLeft;


        windowElement.style.top =
            windowElement.dataset.oldTop;


        windowElement.style.width =
            windowElement.dataset.oldWidth;


        windowElement.style.height =
            windowElement.dataset.oldHeight;


        windowElement.dataset.maximized =
            "false";


        return;

    }


    /*
     * 保存当前位置和大小
     */

    windowElement.dataset.oldLeft =
        windowElement.style.left;


    windowElement.dataset.oldTop =
        windowElement.style.top;


    windowElement.dataset.oldWidth =
        windowElement.style.width;


    windowElement.dataset.oldHeight =
        windowElement.style.height;


    /*
     * 最大化
     */

    windowElement.style.left =
        "0px";


    windowElement.style.top =
        "0px";


    windowElement.style.width =
        "100%";


    windowElement.style.height =
        `calc(100% - ${TASKBAR_HEIGHT_PERCENT}%)`;


    windowElement.dataset.maximized =
        "true";


    bringWindowToFront(
        windowElement
    );

}


/* ==================================================
   Window Events
   ================================================== */

windows.forEach(windowElement => {


    /* ==================================================
       点击窗口
       ================================================== */

    windowElement.addEventListener(
        "pointerdown",
        () => {

            bringWindowToFront(
                windowElement
            );

        }
    );


    /* ==================================================
       最小化
       ================================================== */

    const minimizeButton =
        windowElement.querySelector(
            ".window-minimize"
        );


    if (minimizeButton) {

        minimizeButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                minimizeWindow(
                    windowElement
                );

            }
        );

    }


    /* ==================================================
       最大化
       ================================================== */

    const maximizeButton =
        windowElement.querySelector(
            ".window-maximize"
        );


    if (maximizeButton) {

        maximizeButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                maximizeWindow(
                    windowElement
                );

            }
        );

    }


    /* ==================================================
       关闭
       ================================================== */

    const closeButton =
        windowElement.querySelector(
            ".window-close"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                closeWindow(
                    windowElement
                );

            }
        );

    }


    /* ==================================================
       双击标题栏
       最大化 / 恢复
       ================================================== */

    const header =
        windowElement.querySelector(
            ".window-header"
        );


    if (header) {

        header.addEventListener(
            "dblclick",
            event => {

                /*
                 * 双击按钮区域不处理
                 */

                if (
                    event.target.closest(
                        ".window-controls"
                    )
                ) {

                    return;

                }


                maximizeWindow(
                    windowElement
                );

            }
        );


        /* ==================================================
           窗口拖拽开始
           ================================================== */

        header.addEventListener(
            "pointerdown",
            event => {

                /*
                 * 鼠标只允许左键
                 */

                if (
                    event.pointerType === "mouse" &&
                    event.button !== 0
                ) {

                    return;

                }


                /*
                 * 点击控制按钮不拖动
                 */

                if (
                    event.target.closest(
                        ".window-controls"
                    )
                ) {

                    return;

                }


                /*
                 * 最大化状态不允许直接拖
                 */

                if (
                    windowElement.dataset.maximized ===
                    "true"
                ) {

                    return;

                }


                /*
                 * 开始拖拽
                 */

                draggedWindow =
                    windowElement;


                draggedWindowPointerId =
                    event.pointerId;


                isWindowDragging =
                    true;


                const windowRect =
                    windowElement.getBoundingClientRect();


                windowDragOffsetX =
                    event.clientX -
                    windowRect.left;


                windowDragOffsetY =
                    event.clientY -
                    windowRect.top;


                /*
                 * 窗口置顶
                 */

                bringWindowToFront(
                    windowElement
                );


                /*
                 * 捕获 Pointer
                 */

                header.setPointerCapture(
                    event.pointerId
                );


                event.preventDefault();

            }
        );


        /* ==================================================
           窗口拖拽移动
           ================================================== */

        header.addEventListener(
            "pointermove",
            event => {

                if (
                    !isWindowDragging ||
                    draggedWindow !== windowElement ||
                    draggedWindowPointerId !==
                        event.pointerId
                ) {

                    return;

                }


                const desktopRect =
                    desktop.getBoundingClientRect();


                const windowWidth =
                    windowElement.offsetWidth;


                const windowHeight =
                    windowElement.offsetHeight;


                /*
                 * 计算新位置
                 */

                let x =
                    event.clientX -
                    desktopRect.left -
                    windowDragOffsetX;


                let y =
                    event.clientY -
                    desktopRect.top -
                    windowDragOffsetY;


                /*
                 * 最大 X
                 */

                const maxX =
                    desktopRect.width -
                    windowWidth;


                /*
                 * 最大 Y
                 *
                 * Taskbar 上方结束
                 */

                const maxY =
                    desktopRect.height -
                    getTaskbarHeight() -
                    windowHeight;


                /*
                 * 限制窗口范围
                 */

                x =
                    Math.max(
                        0,
                        Math.min(
                            x,
                            maxX
                        )
                    );


                y =
                    Math.max(
                        0,
                        Math.min(
                            y,
                            maxY
                        )
                    );


                windowElement.style.left =
                    `${x}px`;


                windowElement.style.top =
                    `${y}px`;

            }
        );


        /* ==================================================
           窗口拖拽结束
           ================================================== */

        header.addEventListener(
            "pointerup",
            event => {

                if (
                    draggedWindow !== windowElement ||
                    draggedWindowPointerId !==
                        event.pointerId
                ) {

                    return;

                }


                finishWindowDrag(
                    header
                );

            }
        );


        /* ==================================================
           Pointer Cancel
           ================================================== */

        header.addEventListener(
            "pointercancel",
            event => {

                if (
                    draggedWindow !== windowElement ||
                    draggedWindowPointerId !==
                        event.pointerId
                ) {

                    return;

                }


                finishWindowDrag(
                    header
                );

            }
        );

    }

});


/* ==================================================
   Finish Window Drag
   ================================================== */

function finishWindowDrag(header) {

    /*
     * 释放 Pointer Capture
     */

    if (
        draggedWindowPointerId !== null
    ) {

        try {

            header.releasePointerCapture(
                draggedWindowPointerId
            );

        } catch (error) {

            /*
             * 浏览器已经自动释放时
             * 不需要处理
             */

        }

    }


    /*
     * 清除状态
     */

    draggedWindow =
        null;


    draggedWindowPointerId =
        null;


    isWindowDragging =
        false;

}


/* ==================================================
   Desktop Icon
   ================================================== */

desktopIcons.forEach(icon => {


    /* ==================================================
       单击
       ================================================== */

    icon.addEventListener(
        "click",
        () => {

            desktopIcons.forEach(
                other => {

                    other.classList.remove(
                        "selected"
                    );

                }
            );


            icon.classList.add(
                "selected"
            );

        }
    );


    /* ==================================================
       双击
       ================================================== */

    icon.addEventListener(
        "dblclick",
        () => {

            const windowId =
                icon.dataset.window;


            const windowElement =
                document.getElementById(
                    windowId
                );


            openWindow(
                windowElement
            );

        }
    );

});


/* ==================================================
   Desktop Icon Drag
   ================================================== */

desktopIcons.forEach(icon => {


    /* ==================================================
       Drag Start
       ================================================== */

    icon.addEventListener(
        "pointerdown",
        event => {

            if (
                event.pointerType === "mouse" &&
                event.button !== 0
            ) {

                return;

            }


            draggedIcon =
                icon;


            draggedPointerId =
                event.pointerId;


            isDragging =
                true;


            const rect =
                icon.getBoundingClientRect();


            dragOffsetX =
                event.clientX -
                rect.left;


            dragOffsetY =
                event.clientY -
                rect.top;


            icon.classList.add(
                "dragging"
            );


            icon.setPointerCapture(
                event.pointerId
            );


            event.preventDefault();

        }
    );


    /* ==================================================
       Drag Move
       ================================================== */

    icon.addEventListener(
        "pointermove",
        event => {

            if (
                !isDragging ||
                draggedIcon !== icon ||
                draggedPointerId !==
                    event.pointerId
            ) {

                return;

            }


            const desktopRect =
                desktop.getBoundingClientRect();


            let x =
                event.clientX -
                desktopRect.left -
                dragOffsetX;


            let y =
                event.clientY -
                desktopRect.top -
                dragOffsetY;


            /*
             * 图标不能跑出桌面
             */

            const maxX =
                desktopRect.width -
                icon.offsetWidth;


            const maxY =
                desktopRect.height -
                getTaskbarHeight() -
                icon.offsetHeight;


            x =
                Math.max(
                    0,
                    Math.min(
                        x,
                        maxX
                    )
                );


            y =
                Math.max(
                    0,
                    Math.min(
                        y,
                        maxY
                    )
                );


            icon.style.left =
                `${x}px`;


            icon.style.top =
                `${y}px`;

        }
    );


    /* ==================================================
       Drag End
       ================================================== */

    icon.addEventListener(
        "pointerup",
        event => {

            if (
                draggedIcon !== icon ||
                draggedPointerId !==
                    event.pointerId
            ) {

                return;

            }


            finishDrag(
                icon
            );

        }
    );


    /* ==================================================
       Pointer Cancel
       ================================================== */

    icon.addEventListener(
        "pointercancel",
        event => {

            if (
                draggedIcon !== icon ||
                draggedPointerId !==
                    event.pointerId
            ) {

                return;

            }


            finishDrag(
                icon
            );

        }
    );

});


/* ==================================================
   Finish Desktop Drag
   ================================================== */

function finishDrag(icon) {

    /*
     * 释放 Pointer Capture
     */

    if (
        draggedPointerId !== null
    ) {

        try {

            icon.releasePointerCapture(
                draggedPointerId
            );

        } catch (error) {

        }

    }


    /*
     * 吸附到网格
     */

    snapIconToGrid(
        icon
    );


    icon.classList.remove(
        "dragging"
    );


    /*
     * 清除状态
     */

    draggedIcon =
        null;


    draggedPointerId =
        null;


    isDragging =
        false;

}


/* ==================================================
   Grid Snap
   ================================================== */

function snapIconToGrid(icon) {

    const currentX =
        parseFloat(
            icon.style.left
        ) || 0;


    const currentY =
        parseFloat(
            icon.style.top
        ) || 0;


    /*
     * 计算最近网格
     */

    const gridX =
        Math.round(
            (currentX -
                GRID_OFFSET_X) /
            GRID_WIDTH
        );


    const gridY =
        Math.round(
            (currentY -
                GRID_OFFSET_Y) /
            GRID_HEIGHT
        );


    let targetX =
        GRID_OFFSET_X +
        gridX * GRID_WIDTH;


    let targetY =
        GRID_OFFSET_Y +
        gridY * GRID_HEIGHT;


    const desktopRect =
        desktop.getBoundingClientRect();


    /*
     * 限制范围
     */

    const maxX =
        desktopRect.width -
        icon.offsetWidth;


    const maxY =
        desktopRect.height -
        getTaskbarHeight() -
        icon.offsetHeight;


    targetX =
        Math.max(
            0,
            Math.min(
                targetX,
                maxX
            )
        );


    targetY =
        Math.max(
            0,
            Math.min(
                targetY,
                maxY
            )
        );


    /*
     * 获取目标网格
     */

    const cell =
        getGridCell(
            targetX,
            targetY
        );


    /*
     * 如果目标位置有图标
     * 尝试把它推开
     */

    pushFromCell(
        cell.x,
        cell.y,
        icon
    );


    /*
     * 获取最终空位置
     */

    const finalPosition =
        getFreePosition(
            cell.x,
            cell.y,
            icon
        );


    icon.style.left =
        `${finalPosition.x}px`;


    icon.style.top =
        `${finalPosition.y}px`;

}


/* ==================================================
   Grid Cell
   ================================================== */

function getGridCell(x, y) {

    return {

        x:
            Math.round(
                (x -
                    GRID_OFFSET_X) /
                GRID_WIDTH
            ),

        y:
            Math.round(
                (y -
                    GRID_OFFSET_Y) /
                GRID_HEIGHT
            )

    };

}


/* ==================================================
   Cell -> Position
   ================================================== */

function cellToPosition(
    cellX,
    cellY
) {

    return {

        x:
            GRID_OFFSET_X +
            cellX * GRID_WIDTH,

        y:
            GRID_OFFSET_Y +
            cellY * GRID_HEIGHT

    };

}


/* ==================================================
   Get Icon Cell
   ================================================== */

function getIconCell(icon) {

    const x =
        parseFloat(
            icon.style.left
        ) || 0;


    const y =
        parseFloat(
            icon.style.top
        ) || 0;


    return getGridCell(
        x,
        y
    );

}


/* ==================================================
   Get Icon At Cell
   ================================================== */

function getIconAtCell(
    cellX,
    cellY,
    exceptIcon = null
) {

    for (
        const icon of desktopIcons
    ) {

        if (
            icon === exceptIcon
        ) {

            continue;

        }


        const cell =
            getIconCell(
                icon
            );


        if (
            cell.x === cellX &&
            cell.y === cellY
        ) {

            return icon;

        }

    }


    return null;

}


/* ==================================================
   Push Icon
   ================================================== */

function pushFromCell(
    cellX,
    cellY,
    movingIcon
) {

    const blocker =
        getIconAtCell(
            cellX,
            cellY,
            movingIcon
        );


    /*
     * 没有阻挡
     */

    if (!blocker) {

        return true;

    }


    /*
     * 尝试方向
     *
     * 优先：
     * 下
     * 右
     * 左
     * 上
     */

    const directions = [

        { x: 0, y: 1 },

        { x: 1, y: 0 },

        { x: -1, y: 0 },

        { x: 0, y: -1 },

        { x: 1, y: 1 },

        { x: -1, y: 1 },

        { x: 1, y: -1 },

        { x: -1, y: -1 }

    ];


    for (
        const direction of directions
    ) {

        const nextX =
            cellX +
            direction.x;


        const nextY =
            cellY +
            direction.y;


        /*
         * 不允许进入负坐标
         */

        if (
            nextX < 0 ||
            nextY < 0
        ) {

            continue;

        }


        const nextPosition =
            cellToPosition(
                nextX,
                nextY
            );


        const desktopRect =
            desktop.getBoundingClientRect();


        /*
         * 检查 X 边界
         */

        const maxX =
            desktopRect.width -
            blocker.offsetWidth;


        /*
         * 检查 Y 边界
         */

        const maxY =
            desktopRect.height -
            getTaskbarHeight() -
            blocker.offsetHeight;


        if (
            nextPosition.x > maxX ||
            nextPosition.y > maxY
        ) {

            continue;

        }


        /*
         * 检查下一格有没有图标
         */

        const nextBlocker =
            getIconAtCell(
                nextX,
                nextY,
                movingIcon
            );


        /*
         * 如果还有图标
         * 继续递归推
         */

        if (
            nextBlocker
        ) {

            const success =
                pushFromCell(
                    nextX,
                    nextY,
                    movingIcon
                );


            if (!success) {

                continue;

            }

        }


        /*
         * 移动当前阻挡图标
         */

        blocker.style.left =
            `${nextPosition.x}px`;


        blocker.style.top =
            `${nextPosition.y}px`;


        return true;

    }


    return false;

}


/* ==================================================
   Get Free Position
   ================================================== */

function getFreePosition(
    cellX,
    cellY,
    movingIcon
) {

    /*
     * 当前格子为空
     */

    if (
        !getIconAtCell(
            cellX,
            cellY,
            movingIcon
        )
    ) {

        return cellToPosition(
            cellX,
            cellY
        );

    }


    /*
     * 如果当前位置仍然有冲突
     * 寻找附近网格
     */

    const directions = [

        { x: 0, y: 1 },

        { x: 1, y: 0 },

        { x: -1, y: 0 },

        { x: 0, y: -1 },

        { x: 0, y: 2 },

        { x: 1, y: 1 },

        { x: -1, y: 1 },

        { x: 2, y: 0 },

        { x: -2, y: 0 }

    ];


    for (
        const direction of directions
    ) {

        const x =
            cellX +
            direction.x;


        const y =
            cellY +
            direction.y;


        /*
         * 不允许负坐标
         */

        if (
            x < 0 ||
            y < 0
        ) {

            continue;

        }


        /*
         * 找空位置
         */

        if (
            !getIconAtCell(
                x,
                y,
                movingIcon
            )
        ) {

            return cellToPosition(
                x,
                y
            );

        }

    }


    /*
     * 极端情况下返回原位置
     */

    return cellToPosition(
        cellX,
        cellY
    );

}


/* ==================================================
   Clock
   ================================================== */

function updateClock() {

    const now =
        new Date();


    const hours =
        String(
            now.getHours()
        ).padStart(
            2,
            "0"
        );


    const minutes =
        String(
            now.getMinutes()
        ).padStart(
            2,
            "0"
        );


    clock.textContent =
        `${hours}:${minutes}`;

}


updateClock();


setInterval(
    updateClock,
    1000
);


/* ==================================================
   Desktop 空白点击
   ================================================== */

desktop.addEventListener(
    "pointerdown",
    event => {

        /*
         * 点击桌面空白处
         * 取消图标选中状态
         */

        if (
            event.target === desktop
        ) {

            desktopIcons.forEach(
                icon => {

                    icon.classList.remove(
                        "selected"
                    );

                }
            );

        }

    }
);
