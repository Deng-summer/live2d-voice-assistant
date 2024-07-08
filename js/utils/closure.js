var storedObject = {'0':1,'1':1};

//存储 storedObject
export function createClosure() {
    console.log('createObject','初始赋值')

    function setObject(obj) {
        storedObject = obj
    }

    function getObject() {
        console.log('getObject',storedObject)
        return storedObject;
    }

    // 新增或修改其他函数
    function updateObject(key, value) {
        console.log('updateObject',key,value)
        storedObject[key] = value; // 修改存储对象的属性值
    }

    function clearObject(){
        storedObject = {}; // 清空存储对象
    }

    return {
        setObject: setObject,
        getObject: getObject,
        updateObject: updateObject, // 将新增的函数添加到返回的对象中
        clearObject:clearObject,
    };
}

// var closureInstance = createClosure();
// var myObject = { name: "Example", age: 20 };
// // 存储对象
// closureInstance.setObject(myObject);

// // 获取对象
// var retrievedObject = closureInstance.getObject();
// console.log(retrievedObject); // 输出: { name: "Example", age: 20 }

// // 修改对象
// closureInstance.updateObject("age", 30);
// retrievedObject = closureInstance.getObject();
// console.log(retrievedObject); // 输出: { name: "Example", age: 30 }

// // 清空对象
// closureInstance.clearObject();

// 销毁闭包函数
// 垃圾回收
// 如果该闭包函数没有其他引用指向它，则它会被自动回收，从而释放内存。
// closureInstance = null;  // 将引用赋值为null

