// 初始化
updateCards();
toggleCostInput();
updateColorPreview();

document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('touchstart', e => {
    const targetTag = e.target.tagName.toLowerCase();
    if (!['input', 'textarea', 'button', 'input[type="color"]', 'input[type="file"]'].includes(targetTag)) {
        e.preventDefault();
    }
}, { passive: false });

function toggleCostInput() {
    const costType = document.querySelector('input[name="costType"]:checked').value;
    document.getElementById('costNumInput').style.display = costType === 'none' ? 'none' : 'inline-block';
    updateCards();
}

function updateColorPreview() {
    const color = document.getElementById('textColorPicker').value;
    document.getElementById('previewColor').style.backgroundColor = color;
}

function formatText(type, textareaId) {
    const textarea = document.getElementById(textareaId);
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    if (!selectedText) {
        alert("请先选中要格式化的文字");
        return;
    }

    let newText;
    if (type === 'bold') {
        if (selectedText.startsWith('**') && selectedText.endsWith('**')) {
            newText = textarea.value.substring(0, start) + selectedText.slice(2, -2) + textarea.value.substring(end);
        } else {
            newText = textarea.value.substring(0, start) + `**${selectedText}**` + textarea.value.substring(end);
        }
    } else if (type === 'color') {
        const color = document.getElementById('textColorPicker').value;
        const colorMark = `[color=${color}]`;
        if (selectedText.startsWith(colorMark) && selectedText.endsWith('[/color]')) {
            newText = textarea.value.substring(0, start) + selectedText.slice(colorMark.length, -8) + textarea.value.substring(end);
        } else {
            newText = textarea.value.substring(0, start) + `${colorMark}${selectedText}[/color]` + textarea.value.substring(end);
        }
    }
    textarea.value = newText;
    updateCards();
}

document.getElementById('textColorPicker').addEventListener('change', function() {
    formatText('color', 'descInput');
});

// 预览卡图
function previewCardImg() {
    const file = document.getElementById('cardImgInput').files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        for (let i = 0; i < 3; i++) {
            const imgEl = document.getElementById(`cardImg${i}`);
            imgEl.src = e.target.result;
            imgEl.style.display = 'block';
        }
    }
    reader.readAsDataURL(file);
}

function updateCards() {
    const cardName = document.getElementById('cardNameInput').value;
    const selectedXiuwei = document.querySelector('input[name="xiuwei"]:checked').value;
    const costType = document.querySelector('input[name="costType"]:checked').value;
    const costNum = document.getElementById('costNumInput').value;
    // 获取三个描述框内容，未填写则沿用第一个
    let desc1 = document.getElementById('descInput').value;
    let desc2 = document.getElementById('descInput2').value || desc1;
    let desc3 = document.getElementById('descInput3').value || desc1;
    // 消耗背景图路径修改
    const costIconUrl = costType === 'spirit' ? 'url(ling.png)' : costType === 'life' ? 'url(xue.png)' : 'none';
    // 修正元婴背景图名称（假设元婴背景图为YingYuan.png，可根据实际调整）
    const xiuweiBgMap = {
        LianQi: 'CardUI_LianQi_',
        ZhuJi: 'CardUI_ZhuJi_',
        JinDan: 'CardUI_JinDan_',
        YingYuan: 'CardUI_YingYuan_', // 修正元婴背景图前缀
        HuaShen: 'CardUI_HuaShen_',
        FanXu: 'CardUI_FanXu_'
    };

    // 处理描述格式
    const formatDesc = (desc) => {
        desc = desc.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        desc = desc.replace(/\[color=(#[0-9a-fA-F]{6})\](.*?)\[\/color\]/g, '<span style="color:$1">$2</span>');
        return desc;
    };
    desc1 = formatDesc(desc1);
    desc2 = formatDesc(desc2);
    desc3 = formatDesc(desc3);

    const descList = [desc1, desc2, desc3];
    for (let i = 0; i < 3; i++) {
        const bgUrl = `url(${xiuweiBgMap[selectedXiuwei]}${i}.png)`;
        const bgEl = document.getElementById(`cardBg${i}`);
        bgEl.style.backgroundImage = bgUrl;
        bgEl.style.opacity = "0.99";
        setTimeout(() => bgEl.style.opacity = "1", 10);

        document.getElementById(`cardName${i}`).innerText = cardName;
        document.getElementById(`cardDesc${i}`).innerHTML = descList[i];

        const numEl = document.getElementById(`costNum${i}`);
        if (costType === 'none') {
            numEl.style.display = 'none';
            numEl.style.backgroundImage = 'none';
        } else {
            numEl.style.display = 'block';
            numEl.innerText = costNum;
            numEl.style.backgroundImage = costIconUrl;
        }
    }
}

function exportCardsAsImage() {
    html2canvas(document.getElementById('cardsToExport'), {
        useCORS: true,
        scale: 2,
        logging: false,
        letterRendering: true
    }).then(canvas => {
        const link = document.createElement('a');
        const cardName = document.getElementById('cardNameInput').value;
        const selectedXiuwei = document.querySelector('input[name="xiuwei"]:checked').value;
        link.download = `${cardName}_${selectedXiuwei}_卡牌.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}
