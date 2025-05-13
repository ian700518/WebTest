/**
 * QR Code + Braille 產生器
 * 此腳本用於生成QR碼並在其上疊加盲文，同時計算盲文容量
 */

// 盲文轉換映射表 - 將拉丁字母和符號轉換為對應的盲文字元
const brailleMap = {
    'a': '⠁', 'b': '⠃', 'c': '⠉', 'd': '⠙', 'e': '⠑', 'f': '⠋', 'g': '⠛', 'h': '⠓', 'i': '⠊', 'j': '⠚',
    'k': '⠅', 'l': '⠇', 'm': '⠍', 'n': '⠝', 'o': '⠕', 'p': '⠏', 'q': '⠟', 'r': '⠗', 's': '⠎', 't': '⠞',
    'u': '⠥', 'v': '⠧', 'w': '⠺', 'x': '⠭', 'y': '⠽', 'z': '⠵',
    '1': '⠂', '2': '⠆', '3': '⠒', '4': '⠲', '5': '⠢', '6': '⠖', '7': '⠶', '8': '⠦', '9': '⠔', '0': '⠴',
    ' ': '⠀', '.': '⠲', ',': '⠐', ';': '⠰', ':': '⠱', '?': '⠹', '!': '⠮', "'": '⠄', '"': '⠐⠂',
    '-': '⠤', '/': '⠌', '\\': '⠡', '(': '⠣', ')': '⠜', '[': '⠪', ']': '⠻', '{': '⠫', '}': '⠻',
    '@': '⠈', '#': '⠼', '%': '⠨⠴', '&': '⠯', '*': '⠡', '+': '⠬', '=': '⠿', '<': '⠣', '>': '⠜',
    '`': '⠫', '^': '⠘', '_': '⠸', '|': '⠳', '~': '⠻'
};

// 盲文點陣表示映射表 - 將盲文字元映射到其點陣表示
// 點的編號：1 4
//          2 5
//          3 6
// 1表示凸起，0表示平坦
const brailleDotPatterns = {
    '⠀': [0, 0, 0, 0, 0, 0], // 空格
    '⠁': [1, 0, 0, 0, 0, 0], // a
    '⠃': [1, 1, 0, 0, 0, 0], // b
    '⠉': [1, 0, 0, 1, 0, 0], // c
    '⠙': [1, 0, 0, 1, 1, 0], // d
    '⠑': [1, 0, 0, 0, 1, 0], // e
    '⠋': [1, 1, 0, 1, 0, 0], // f
    '⠛': [1, 1, 0, 1, 1, 0], // g
    '⠓': [1, 1, 0, 0, 1, 0], // h
    '⠊': [0, 1, 0, 1, 0, 0], // i
    '⠚': [0, 1, 0, 1, 1, 0], // j
    '⠅': [1, 0, 1, 0, 0, 0], // k
    '⠇': [1, 1, 1, 0, 0, 0], // l
    '⠍': [1, 0, 1, 1, 0, 0], // m
    '⠝': [1, 0, 1, 1, 1, 0], // n
    '⠕': [1, 0, 1, 0, 1, 0], // o
    '⠏': [1, 1, 1, 1, 0, 0], // p
    '⠟': [1, 1, 1, 1, 1, 0], // q
    '⠗': [1, 1, 1, 0, 1, 0], // r
    '⠎': [0, 1, 1, 1, 0, 0], // s
    '⠞': [0, 1, 1, 1, 1, 0], // t
    '⠥': [1, 0, 1, 0, 0, 1], // u
    '⠧': [1, 1, 1, 0, 0, 1], // v
    '⠺': [0, 1, 0, 1, 1, 1], // w
    '⠭': [1, 0, 1, 1, 0, 1], // x
    '⠽': [1, 0, 1, 1, 1, 1], // y
    '⠵': [1, 0, 1, 0, 1, 1], // z
    '⠂': [0, 1, 0, 0, 0, 0], // 1
    '⠆': [0, 1, 1, 0, 0, 0], // 2
    '⠒': [0, 1, 0, 0, 1, 0], // 3
    '⠲': [0, 1, 0, 0, 1, 1], // 4
    '⠢': [0, 1, 0, 0, 0, 1], // 5
    '⠖': [0, 1, 1, 0, 1, 0], // 6
    '⠶': [0, 1, 1, 0, 1, 1], // 7
    '⠦': [0, 1, 1, 0, 0, 1], // 8
    '⠔': [0, 0, 1, 0, 1, 0], // 9
    '⠴': [0, 0, 1, 0, 1, 1], // 0
    '⠄': [0, 0, 0, 0, 0, 1], // '
    '⠤': [0, 0, 1, 0, 0, 1], // -
    '⠰': [0, 0, 0, 0, 1, 1], // ;
    '⠱': [0, 0, 0, 1, 1, 1], // :
    '⠹': [0, 0, 1, 1, 1, 1], // ?
    '⠮': [0, 0, 1, 1, 0, 1], // !
    '⠌': [0, 0, 1, 1, 0, 0], // /
    '⠡': [1, 0, 0, 0, 0, 1], // *
    '⠣': [1, 1, 0, 0, 0, 1], // (
    '⠜': [0, 1, 1, 1, 0, 1], // )
    '⠪': [1, 1, 0, 1, 0, 1], // [
    '⠻': [0, 1, 1, 1, 1, 1], // ]
    '⠫': [1, 1, 0, 1, 1, 1], // {
    '⠈': [0, 0, 0, 1, 0, 0], // @
    '⠼': [0, 0, 1, 1, 1, 0], // #
    '⠯': [1, 1, 1, 0, 1, 1], // &
    '⠬': [0, 0, 1, 1, 0, 1], // +
    '⠿': [1, 1, 1, 1, 1, 1], // =
    '⠳': [1, 1, 0, 0, 1, 1], // |
    '⠘': [0, 0, 0, 1, 1, 0], // ^
    '⠸': [0, 0, 0, 1, 1, 1]  // _
};

// 盲文尺寸常數 - 用於計算盲文在QR碼上的佈局
const BRAILLE_CHAR_WIDTH_PX = 16;  // 盲文字元的近似寬度（像素）
const BRAILLE_CHAR_HEIGHT_PX = 24; // 盲文字元的近似高度（像素）
const BRAILLE_LINE_HEIGHT_FACTOR = 1.5; // 盲文行高因子

/**
 * 頁面載入完成後初始化應用程式
 */
document.addEventListener('DOMContentLoaded', function () {
    // 獲取顏色選擇器元素
    const foregroundInput = document.getElementById('foreground');
    const backgroundInput = document.getElementById('background');
    const foregroundPreview = document.getElementById('foreground-preview');
    const backgroundPreview = document.getElementById('background-preview');
    const brailleColorInput = document.getElementById('braille-color');
    const brailleColorPreview = document.getElementById('braille-color-preview');

    // 設置顏色選擇器的變更事件監聽器
    foregroundInput.addEventListener('input', function () {
        foregroundPreview.style.backgroundColor = this.value;
    });

    backgroundInput.addEventListener('input', function () {
        backgroundPreview.style.backgroundColor = this.value;
    });

    brailleColorInput.addEventListener('input', function () {
        brailleColorPreview.style.backgroundColor = this.value;
    });

    // 初始化顏色預覽
    foregroundPreview.style.backgroundColor = foregroundInput.value;
    backgroundPreview.style.backgroundColor = backgroundInput.value;
    brailleColorPreview.style.backgroundColor = brailleColorInput.value;

    // 設置生成按鈕的點擊事件
    document.getElementById('generate-btn').addEventListener('click', function () {
        // 直接調用 generateCombinedOutput，掩碼模式會在 generateQRCode 中獲取
        generateCombinedOutput();
    });

    // 設置下載按鈕的點擊事件
    document.getElementById('download-btn').addEventListener('click', function () {
        downloadCombinedOutput();
    });
});

/**
 * 生成組合輸出（QR碼 + 盲文）
 */
function generateCombinedOutput() {
    // 生成QR碼（盲文疊加會在QR碼生成的回調函數中完成）
    generateQRCode();
}

/**
 * 生成QR碼
 * @returns {Object} 包含QR碼尺寸和生成狀態的對象
 */
function generateQRCode() {
    // 獲取用戶輸入的參數
    const content = document.getElementById('content').value;
    const version = parseInt(document.getElementById('version').value);
    const pixelSize = parseInt(document.getElementById('pixel-size').value);
    const errorCorrection = document.getElementById('error-correction').value;
    const foreground = document.getElementById('foreground').value;
    const background = document.getElementById('background').value;
    const dpi = parseInt(document.getElementById('dpi').value);
    const maskPattern = parseInt(document.getElementById('mask-pattern').value);

    // 驗證輸入
    if (!content) {
        alert('請輸入要轉換為QR Code的內容');
        return { success: false };
    }

    if (version < 1 || version > 40) {
        alert('QR Code版本必須在1-40之間');
        return { success: false };
    }

    if (pixelSize < 1 || pixelSize > 20) {
        alert('模組像素比例必須在1-20之間');
        return { success: false };
    }

    // 清除先前的QR碼
    const qrcodeDiv = document.getElementById('qrcode');
    qrcodeDiv.innerHTML = '';

    // 生成QR碼
    try {
        // 計算模塊數量（基於版本）- 先計算再使用
        const moduleCount = 21 + (version - 1) * 4;

        // 設置Canvas尺寸 - 增加外框大小
        const frameSize = pixelSize;
        const canvasWidth = (moduleCount * pixelSize) + (frameSize * 2);
        const canvasHeight = (moduleCount * pixelSize) + (frameSize * 2);

        // 設置QR碼選項
        const options = {
            errorCorrectionLevel: errorCorrection,
            version: version,
            margin: 0, // 設置邊距為0，我們會自己處理外框
            width: moduleCount * pixelSize, // 現在可以安全使用 moduleCount
            color: {
                dark: foreground,
                light: background
            }
        };

        // 如果指定了掩碼模式（不是-1），則設置掩碼
        if (maskPattern >= 0 && maskPattern <= 7) {
            options.maskPattern = maskPattern;
        }

        // 創建Canvas元素
        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext('2d');

        // 填充整個Canvas為背景色（包括外框）
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 創建一個臨時Canvas用於生成QR碼
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = moduleCount * pixelSize;
        tempCanvas.height = moduleCount * pixelSize;

        // 使用node-qrcode庫生成QR碼到臨時Canvas
        QRCode.toCanvas(tempCanvas, content, options, function (error) {
            if (error) {
                console.error('生成QR碼時發生錯誤:', error);
                alert('生成QR Code時發生錯誤：' + error);
                return;
            }

            // 將臨時Canvas上的QR碼繪製到主Canvas上（考慮外框）
            ctx.drawImage(tempCanvas, frameSize, frameSize);

            // 從Canvas創建圖像
            const qrImage = new Image();
            qrImage.src = canvas.toDataURL('image/png');

            // 將圖像添加到DOM
            qrcodeDiv.appendChild(qrImage);

            // 啟用下載按鈕
            document.getElementById('download-btn').disabled = false;

            // 在QR碼上疊加盲文
            overlayBrailleOnQRCode({
                width: canvasWidth,
                height: canvasHeight,
                widthCm: canvasWidth / (dpi / 2.54),
                heightCm: canvasHeight / (dpi / 2.54)
            }, moduleCount, pixelSize);
        });

        // 計算並顯示物理尺寸
        const widthCm = canvasWidth / (dpi / 2.54);
        const heightCm = canvasHeight / (dpi / 2.54);

        // 顯示尺寸信息
        const sizeInfo = document.getElementById('size-info');
        sizeInfo.innerHTML = `<strong>QR Code 尺寸：</strong> ${widthCm.toFixed(2)} cm × ${heightCm.toFixed(2)} cm`;

        // 返回成功狀態，實際的QR碼生成和盲文疊加會在回調函數中完成
        return {
            success: true,
            qrSize: {
                width: canvasWidth,
                height: canvasHeight,
                widthCm: widthCm,
                heightCm: heightCm
            },
            qrModuleCount: moduleCount,
            pixelSize: pixelSize,
            frameSize: frameSize
        };
    } catch (error) {
        alert('生成QR Code時發生錯誤：' + error.message);
        return { success: false };
    }
}


// 在 script.js 檔案中找到 overlayBrailleOnQRCode 函數中繪製盲文點的部分
// 修改繪製點的部分，將實心圓點改為空心圓圈

// 在文件頂部添加一個新的常數來設定圓圈框線粗細
const BRAILLE_DOT_STROKE_WIDTH = 1.5; // 盲文點圓圈框線粗細（像素）

/**
 * 在QR碼上疊加盲文
 * @param {Object} qrSize - QR碼的尺寸信息
 * @param {number} moduleCount - QR碼的模塊數量
 * @param {number} pixelSize - 每個模塊的像素大小
 */
function overlayBrailleOnQRCode(qrSize, moduleCount, pixelSize) {
    const brailleContent = document.getElementById('braille-content').value;
    const brailleColor = document.getElementById('braille-color').value;
    const dpi = parseInt(document.getElementById('dpi').value);
    // 獲取使用者設定的框線粗細
    const brailleStrokeWidth = parseFloat(document.getElementById('braille-stroke-width').value);

    // 獲取外框大小（等於模組像素大小）
    const frameSize = pixelSize;

    if (!brailleContent) {
        alert('請輸入要轉換為盲文的內容');
        return;
    }

    // 將文本轉換為盲文
    const brailleChars = Array.from(brailleContent.toLowerCase()).map(char => {
        return brailleMap[char] || char;
    });

    // 清除先前的盲文疊加層
    const brailleOverlay = document.getElementById('braille-overlay');
    brailleOverlay.innerHTML = '';

    // 設置疊加層尺寸以匹配QR碼
    brailleOverlay.style.width = qrSize.width + 'px';
    brailleOverlay.style.height = qrSize.height + 'px';

    // 標準盲文尺寸（毫米）- 根據國際標準
    const standardBrailleDotDiameter = 1.5; // 標準盲文點直徑 (mm)
    const standardBrailleDotSpacing = 2.5; // 標準盲文點間距 (mm) - 從點中心到點中心的距離
    const standardBrailleCharSpacing = 6.0; // 標準盲文字元間距 (mm) - 從第一方第一點到第二方第一點的距離
    const standardBrailleLineSpacing = 5.0; // 標準盲文行間距 (mm)

    // 計算標準盲文字元尺寸
    // 字元寬度 = 兩列點之間的間距 (從第一列點中心到第二列點中心)
    const standardBrailleCharWidth = standardBrailleDotSpacing;
    // 字元高度 = 三行點之間的總間距 (從第一行點中心到第三行點中心)
    const standardBrailleCharHeight = 2 * standardBrailleDotSpacing;

    // 將標準尺寸轉換為像素
    const pixelsPerMm = dpi / 25.4; // 1英寸 = 25.4毫米
    const brailleDotDiameterPx = Math.round(standardBrailleDotDiameter * pixelsPerMm);
    const brailleDotSpacingPx = Math.round(standardBrailleDotSpacing * pixelsPerMm);
    const brailleCharWidthPx = Math.round(standardBrailleCharWidth * pixelsPerMm);
    const brailleCharHeightPx = Math.round(standardBrailleCharHeight * pixelsPerMm);
    const brailleCharSpacingPx = Math.round(standardBrailleCharSpacing * pixelsPerMm);
    const brailleLineSpacingPx = Math.round(standardBrailleLineSpacing * pixelsPerMm);

    // 計算實際使用的尺寸（轉回毫米以顯示）
    const actualBrailleDotDiameterMm = brailleDotDiameterPx / pixelsPerMm;
    const actualBrailleDotSpacingMm = brailleDotSpacingPx / pixelsPerMm;
    const actualBrailleCharWidthMm = brailleCharWidthPx / pixelsPerMm;
    const actualBrailleCharHeightMm = brailleCharHeightPx / pixelsPerMm;
    const actualBrailleCharSpacingMm = brailleCharSpacingPx / pixelsPerMm;
    const actualBrailleLineSpacingMm = brailleLineSpacingPx / pixelsPerMm;

    // 安全邊距
    const minimumSafeMarginPx = 5; // 5像素的最小安全邊距

    // 計算定位點區域，考慮外框
    const finderPatternSize = 7 * pixelSize; // 定位點大小為7x7模塊

    // 計算可用區域（避開定位點），考慮外框
    // QR碼有三個定位點：左上角、右上角和左下角
    const leftTopFinderEndY = frameSize + finderPatternSize + minimumSafeMarginPx;
    const leftBottomFinderStartY = qrSize.height - frameSize - finderPatternSize;
    const leftBottomFinderEndY = qrSize.height - frameSize;
    const leftFinderEndX = frameSize + finderPatternSize + minimumSafeMarginPx;
    const rightTopFinderStartX = qrSize.width - frameSize - finderPatternSize - minimumSafeMarginPx;

    // 盲文起始位置
    const initialStartY = leftTopFinderEndY + minimumSafeMarginPx;

    // 創建SVG元素
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", qrSize.width);
    svg.setAttribute("height", qrSize.height);
    svg.style.position = "absolute";
    svg.style.top = "0";
    svg.style.left = "0";

    // 1. 檢查左上與左下定位點之間的距離，判斷是否可以輸出至少一行盲文
    const verticalSpaceBetweenFinders = leftBottomFinderStartY - initialStartY;
    const canDisplayOneLine = verticalSpaceBetweenFinders >= brailleCharHeightPx;

    if (!canDisplayOneLine) {
        // QR碼太小，無法容納一行盲文
        // 不在QR碼上顯示任何警告，只在容量資訊中提示

        // 顯示盲文容量信息
        const capacityInfo = document.getElementById('braille-capacity-info');
        capacityInfo.innerHTML = `
            <strong>盲文容量資訊：</strong><br>
            <span style="color: red;">警告：QR碼太小，無法容納盲文而不干擾定位點</span><br>
            <br>
            <strong>盲文尺寸資訊（實際計算值，毫米）：</strong><br>
            盲文點直徑：${actualBrailleDotDiameterMm.toFixed(2)} mm<br>
            盲文點間距：${actualBrailleDotSpacingMm.toFixed(2)} mm<br>
            盲文字元寬度：${actualBrailleCharWidthMm.toFixed(2)} mm<br>
            盲文字元高度：${actualBrailleCharHeightMm.toFixed(2)} mm<br>
            盲文字元間距：${actualBrailleCharSpacingMm.toFixed(2)} mm<br>
            盲文行間距：${actualBrailleLineSpacingMm.toFixed(2)} mm<br>
            使用DPI：${dpi} dpi（像素/英寸）<br>
            像素/毫米比率：${pixelsPerMm.toFixed(2)} 像素/mm
        `;
        return;
    }

    // 處理盲文文本，分行並處理左下角定位點
    let lines = [];
    let currentY = initialStartY;
    let charIndex = 0;
    let lineCount = 0;
    let remainingHeight = 0;

    // 逐行處理盲文，直到沒有足夠空間或處理完所有字元
    while (charIndex < brailleChars.length) {
        // 檢查是否有足夠空間放置新的一行
        // 盲文第二行以上檢查: 在前面行數總高度+總行距後, 剩餘距離如果大於盲文高度, 則能再輸出新的一行
        const totalHeightUsed = lineCount > 0 ?
            (lineCount * brailleCharHeightPx) + ((lineCount - 1) * brailleLineSpacingPx) : 0;
        if (lineCount > 0) {
            remainingHeight = qrSize.height - initialStartY - totalHeightUsed;
        }
        else {
            remainingHeight = leftBottomFinderStartY - initialStartY - totalHeightUsed;
        }

        if (remainingHeight < brailleCharHeightPx) {
            // 沒有足夠空間放置新的一行
            break;
        }

        // 確定當前行的起始X位置，考慮外框
        let startX = frameSize + minimumSafeMarginPx;

        // 計算當前行的底部Y位置
        if (lineCount > 0) {
            const lineBottom = currentY + brailleCharHeightPx;

            // 盲文第二行以上檢查: 新的一行如果從X軸等於0開始輸出會影響到QR Code的左下角定位點時, 需要持續右移X軸到不影響為止
            if (lineBottom >= leftBottomFinderStartY && startX < leftFinderEndX) {
                // 如果行會干擾左下角定位點，則從左側定位點之後開始
                startX = leftFinderEndX + minimumSafeMarginPx;
            }
        }

        // 處理當前行
        let currentLine = [];
        let charCountInLine = 0;

        // 逐個添加字元到當前行
        while (charIndex < brailleChars.length) {
            const char = brailleChars[charIndex];

            // 計算字元位置
            // 第一個字元從startX開始
            // 後續字元需要考慮前面字元的位置和字元間距
            let charX;
            if (charCountInLine === 0) {
                charX = startX;
            } else {
                // 關鍵修改：確保字元間距是從第一方第一點到第二方第一點的距離為6mm
                // 由於我們的字元位置是基於第一點的位置，所以直接使用標準字元間距
                charX = currentLine[charCountInLine - 1].x + brailleCharSpacingPx;
            }

            // 檢查是否超出QR碼寬度
            // 需要考慮字元的完整寬度（包括兩列點）
            if (charX + brailleCharWidthPx > qrSize.width - frameSize) {  // 考慮右側外框
                // 如果行中已有字元，則結束當前行
                if (charCountInLine > 0) {
                    break;
                }
                // 如果行中沒有字元且一個字元都放不下，則跳過這行
                else {
                    break;
                }
            }

            // 添加字元到當前行
            currentLine.push({
                char: char,
                x: charX
            });

            charCountInLine++;
            charIndex++;

            // 如果已處理完所有字元，跳出循環
            if (charIndex >= brailleChars.length) {
                break;
            }
        }

        // 如果當前行有字元，添加到行列表
        if (currentLine.length > 0) {
            lines.push({
                chars: currentLine,
                y: currentY
            });

            // 更新Y位置到下一行
            currentY = initialStartY + totalHeightUsed + brailleCharHeightPx + brailleLineSpacingPx;
            lineCount++;
        } else {
            // 如果一個字元都放不下，跳出循環
            break;
        }
    }

    // 使用SVG點陣方式繪製盲文行
    lines.forEach(line => {
        line.chars.forEach(charInfo => {
            // 獲取盲文字元的點陣表示
            const dotPattern = brailleDotPatterns[charInfo.char] || [0, 0, 0, 0, 0, 0];

            // 為每個盲文字元創建一個組
            const group = document.createElementNS(svgNS, "g");
            group.setAttribute("transform", `translate(${charInfo.x}, ${line.y})`);

            // 繪製6個點位置（無論是否凸起）
            for (let i = 0; i < 6; i++) {
                // 計算點的位置
                let dotX, dotY;

                // 根據點的編號計算位置
                // 點的編號：
                // 1 4
                // 2 5
                // 3 6
                switch (i) {
                    case 0: // 點1
                        dotX = 0;
                        dotY = 0;
                        break;
                    case 1: // 點2
                        dotX = 0;
                        dotY = brailleDotSpacingPx;
                        break;
                    case 2: // 點3
                        dotX = 0;
                        dotY = 2 * brailleDotSpacingPx;
                        break;
                    case 3: // 點4
                        dotX = brailleDotSpacingPx;
                        dotY = 0;
                        break;
                    case 4: // 點5
                        dotX = brailleDotSpacingPx;
                        dotY = brailleDotSpacingPx;
                        break;
                    case 5: // 點6
                        dotX = brailleDotSpacingPx;
                        dotY = 2 * brailleDotSpacingPx;
                        break;
                }

                // 創建點的圓形元素
                const dot = document.createElementNS(svgNS, "circle");
                dot.setAttribute("cx", dotX);
                dot.setAttribute("cy", dotY);
                dot.setAttribute("r", brailleDotDiameterPx / 2);

                // 設置點的樣式
                if (dotPattern[i] === 1) {
                    // 凸起的點 - 改為空心圓圈
                    dot.setAttribute("fill", "none");
                    dot.setAttribute("stroke", brailleColor);
                    dot.setAttribute("stroke-width", brailleStrokeWidth);
                } else {
                    // 平坦的點（可選：可以不繪製或使用透明色）
                    dot.setAttribute("fill", "none");
                    dot.setAttribute("stroke", brailleColor);
                    dot.setAttribute("stroke-width", "0.5");
                    dot.setAttribute("opacity", "0.3");
                }

                group.appendChild(dot);
            }

            svg.appendChild(group);
        });
    });

    // 將SVG添加到疊加層
    brailleOverlay.appendChild(svg);

    // 計算總容量和已使用字元數
    const totalCapacity = brailleChars.length;
    const usedChars = charIndex;

    // 顯示盲文容量信息
    const capacityInfo = document.getElementById('braille-capacity-info');
    capacityInfo.innerHTML = `
        <strong>盲文容量資訊：</strong><br>
        已使用盲文字元數：${usedChars} 個<br>
        總盲文字元數：${totalCapacity} 個<br>
        可顯示行數：${lines.length} 行<br>
        ${usedChars < totalCapacity ? '<span style="color: red;">警告：部分盲文內容超出 QR Code 可容納範圍，將不會顯示</span>' : ''}
        <br>
        <strong>盲文尺寸資訊（實際計算值，毫米）：</strong><br>
        盲文點直徑：${actualBrailleDotDiameterMm.toFixed(2)} mm<br>
        盲文點間距：${actualBrailleDotSpacingMm.toFixed(2)} mm<br>
        盲文字元寬度：${actualBrailleCharWidthMm.toFixed(2)} mm<br>
        盲文字元高度：${actualBrailleCharHeightMm.toFixed(2)} mm<br>
        盲文字元間距：${actualBrailleCharSpacingMm.toFixed(2)} mm<br>
        盲文行間距：${actualBrailleLineSpacingMm.toFixed(2)} mm<br>
        使用DPI：${dpi} dpi（像素/英寸）<br>
        像素/毫米比率：${pixelsPerMm.toFixed(2)} 像素/mm
    `;
}

function downloadCombinedOutput() {
    // 獲取QR碼圖像
    const qrImage = document.querySelector('#qrcode img');
    if (!qrImage) {
        alert('找不到 QR 碼圖像，請先生成 QR 碼');
        return;
    }

    // 創建一個新的Canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = qrImage.width;
    canvas.height = qrImage.height;

    // 繪製QR碼
    ctx.drawImage(qrImage, 0, 0);

    // 獲取盲文SVG
    const brailleSVG = document.querySelector('#braille-overlay svg');
    if (brailleSVG) {
        // 將SVG轉換為圖像並繪製
        const svgData = new XMLSerializer().serializeToString(brailleSVG);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgURL = URL.createObjectURL(svgBlob);

        const tempImg = new Image();
        tempImg.onload = function () {
            ctx.drawImage(tempImg, 0, 0);
            URL.revokeObjectURL(svgURL);
            downloadCanvas(canvas, 'qrcode-with-braille.png');
        };
        tempImg.src = svgURL;
    } else {
        // 直接下載QR碼
        downloadCanvas(canvas, 'qrcode.png');
    }
}

/**
 * 輔助函數：下載Canvas為圖像
 * @param {HTMLCanvasElement} canvas - 要下載的Canvas元素
 * @param {string} filename - 下載的檔案名
 */
function downloadCanvas(canvas, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
}



