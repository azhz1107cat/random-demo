// 定义全局变量
let g_peopleData = JSON.parse(localStorage.getItem("people")) || [];
$('.make-inputs-from-storage').prop('disabled', g_peopleData.length === 0);
let g_inputList = [];
let g_peopleList = [];
let g_peopleNumberToCall = 0;
let g_groupNumber = 1;
let g_PeopleCanRepeat = false;
let g_UseSafe = false;
let g_autoSaveList = true;

// 更新 g_peopleList 的函数
function updatePeopleList() {
    g_peopleList = g_inputList.map(element => element.val().trim());
}

// 核心函数, 定义抽取的方法
function callPeople() {
    function unSafeModel() {
        return Number(Math.random().toFixed(16));
    }

    function safeModel() {
        const num16array = new Uint32Array(1);
        crypto.getRandomValues(num16array);
        const randomFraction = num16array[0] / Math.pow(2, 32);
        return Number(randomFraction.toFixed(16));
    }

    let randomResult = [];
    const getRandom16Dec = g_UseSafe ? safeModel : unSafeModel;
    const numToCallPeople = g_groupNumber * g_peopleNumberToCall;

    for (let i = 0; i < numToCallPeople; i++) {
        randomResult.push(g_peopleList[Math.floor(getRandom16Dec() * g_peopleList.length)]);
    }

    let arrToBeInTable = [];

    if (g_PeopleCanRepeat) {
        arrToBeInTable = [...randomResult];
    } else {
        arrToBeInTable = Array.from(new Set([...randomResult]));
        if (arrToBeInTable.length!== randomResult.length) {
            let thePeopleWastRandom = g_peopleList.filter(person => !arrToBeInTable.includes(person));
            let peopleNumNeedToRandom = randomResult.length - arrToBeInTable.length;

            const randomIndices = new Set();
            while (randomIndices.size < peopleNumNeedToRandom) {
                const randomIndex = Math.floor(getRandom16Dec() * thePeopleWastRandom.length);
                randomIndices.add(randomIndex);
            }

            let supplementPeopleArr = Array.from(randomIndices).map((index) => thePeopleWastRandom[index]);
            arrToBeInTable.push(...supplementPeopleArr);
        }
    }

    let randomResultToReturn = [];
    let currentGroup = [];
    for (const item of arrToBeInTable) {
        currentGroup.push(item);
        if (currentGroup.length === g_peopleNumberToCall) {
            randomResultToReturn.push([...currentGroup]);
            currentGroup = [];
        }
    }
    if (currentGroup.length > 0) {
        randomResultToReturn.push([...currentGroup]);
    }

    return randomResultToReturn;
}

$(document).ready(function () {
    if ($(".show-inputs").children().length >= 10e15) {
        page_infoWindow("注意", "人数过多");
    }

    $(document).on("click", ".open-setting", function () {
        $(".setting-window").css("display", "flex");
    });

    $(document).on("click", ".open-inputs", function () {
        $(".inputs-window").css("display", "flex");
    });

    $(document).on("click", ".window-close", function () {
        $(this).parent().parent().parent().hide();
    });

    $(document).on("click", ".setting-window .window-enter", function () {
        let numberToCall = $(".get-number-to-call").val();
        let groupToCall = $(".get-group-to-call").val();

        numberToCall = parseInt(numberToCall);
        groupToCall = parseInt(groupToCall);

        if (numberToCall == null || groupToCall == null || numberToCall == "" || groupToCall == "") {
            page_infoWindow("错误", "输入框 不能为空");
            return;
        } else if (typeof numberToCall!== 'number' || typeof groupToCall!== 'number') {
            page_infoWindow("错误", "请检查 抽取人数与 组数，它们必须是数字");
            return;
        } else if (!Number.isInteger(numberToCall) ||!Number.isInteger(groupToCall)) {
            page_infoWindow("错误", "请检查 抽取人数与 组数 使其为整数");
            return;
        } else if (groupToCall < 1 || numberToCall <= 1) {
            page_infoWindow("错误", "当前不可分组");
            return;
        }

        g_peopleNumberToCall = numberToCall;
        g_groupNumber = groupToCall;
        g_autoSaveList = $("#autoSavePeopleList").is(":checked");
        g_UseSafe = $("#useSafe").is(":checked");
        g_PeopleCanRepeat = $("#canRepeat").is(":checked");

        const settingArr = [
            g_peopleNumberToCall,
            g_groupNumber,
            g_PeopleCanRepeat,
            g_UseSafe,
            g_autoSaveList
        ];

        localStorage.setItem('setting', JSON.stringify(settingArr));
        $(this).parent().parent().parent().hide();
    });

    $(document).on("click", ".inputs-window .window-enter", function () {
        $(".num-to-catch").text(g_peopleList.length);
        localStorage.setItem('people', JSON.stringify(g_peopleList));
        $(this).parent().parent().parent().hide();
    });

    $(document).on("click", ".start", function () {
        if (g_peopleList.length <= 1) {
            page_infoWindow("错误", "人员 大于 1 时才可抽取");
            return;
        }
        showRandomReslut(callPeople());
    });

    $(document).on("click", ".make-inputs-from-file-onload", function () {
        $('#fileInput').click();
    });

    $(document).on("change", '#fileInput', function () {
        const fileInput = $('#fileInput')[0];
        if (fileInput.files.length > 0) {
            const selectedFile = fileInput.files[0];
            const readFile = new FileReader();
            let parsedData = null;

            readFile.onload = function (event) {
                const fileData = new Uint8Array(event.target.result);
                const workbook = XLSX.read(fileData, { type: 'array' });
                parsedData = {};
                const sheetNames = workbook.SheetNames;
                sheetNames.forEach(sheetName => {
                    const worksheet = workbook.Sheets[sheetName];
                    parsedData[sheetName] = XLSX.utils.sheet_to_json(worksheet);
                });
                for (const sheet in parsedData) {
                    parsedData[sheet].forEach((row) => {
                        for (const key in row) {
                            addInput(row[key]);
                        }
                    });
                }
            };

            readFile.readAsArrayBuffer(selectedFile);
        } else {
            page_infoWindow("错误", "没有文件");
        }
    });

    $(document).on("click", ".make-inputs-from-text", async function () {
        const textareaBoxText = await page_textareaBox("输入文本以转换为人员名单","输入文本以转换为人员名单");
        if (textareaBoxText != "") {
            if (textareaBoxText.endsWith('\n')) {
                textareaBoxText = textareaBoxText.slice(0, -1);
            }
            const tbox_toList = textareaBoxText.split("\n");
            tbox_toList.forEach((element) => {
                addInput(element);
            });
        }
    });

    $(document).on("click", ".make-inputs-from-storage", function () {
        g_peopleData.forEach((element) => {
            addInput(element);
        });
    });

    $(document).on("click", ".make-new-input", function () {
        addInput();
    });

    $(document).on("click", ".clean-all-inputs", async function () {
        if (await page_askWindow("重要", "是否删除", "red")) {
            g_peopleList.length = 0;
            g_inputList.length = 0;
            $(".show-inputs").empty();
        }
    });

    $(document).on("click", ".remove-input", function () {
        const parentElement = $(this).parent();
        const inputIndex = g_inputList.findIndex(item => item.closest('.input-div')[0] === parentElement[0]);
        if (inputIndex!== -1) {
            g_inputList.splice(inputIndex, 1);
            updatePeopleList();
        }
        parentElement.remove();
    });
});

function addInput(inputValue = "") {
    const wholeInputDiv = $("<div class='input-div'></div>");
    const singleInput = $("<input type='text'/>");
    const removeInput = $('<button class="remove-input"><img src="styles/FontAwesome/xmark-solid.svg" width="32" height="32"/>删除</button>');

    singleInput.val(inputValue);
    singleInput.appendTo(wholeInputDiv);
    removeInput.appendTo(wholeInputDiv);
    wholeInputDiv.appendTo($(".show-inputs"));

    g_inputList.push(singleInput);
    updatePeopleList();
}

function showRandomReslut(list) {
    const showResultMain = $(".put-result-main");
    const btnToCopyResult = $(".btn-to-copy-result");
    const btnToSaveResult = $(".btn-to-save-result");
    const btnToChangeView = $(".btn-to-change-view");

    btnToCopyResult.prop("disabled", false);
    btnToSaveResult.prop("disabled", false);
    btnToChangeView.prop("disabled", false);

    btnToCopyResult.on("click", (event) => {
        // 复制抽取结果
        const resultText = list.map(group => group.join('\n')).join('\n\n');
        navigator.clipboard.writeText(resultText).then(() => {
            console.log('复制成功');
        }).catch((error) => {
            console.error('复制失败:', error);
        });
    });

    btnToSaveResult.on("click", (event) => {
        // 保存抽取结果
        const resultText = list.map(group => group.join('\n')).join('\n\n');
        const blob = new Blob([resultText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'result.txt';
        a.click();
        URL.revokeObjectURL(url);
    });

    btnToChangeView.on("click", (event) => {
        // 切换视图
    });

    list.forEach((element, index) => {
        let singleGroupDiv = $("<div class='for-list-group-zone'></div>");
        element.forEach((elementSmall, indexSmall) => {
            singleGroupDiv.append(elementSmall);
            singleGroupDiv.append("<br/>");
        });
        singleGroupDiv.appendTo(showResultMain);
    });
}