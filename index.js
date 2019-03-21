import React from 'react';
let lazyLoadScrollViews= [];
/**
 * 懒加载（适用多scrollview）
 * !!!! 在指定 scrollView 增加属性 lazyscrollview，该scrollView将被监听
 * @param {*} width 宽
 * @param {*} height 高
 * @param {*} offset 缓冲长度 默认200
 * @param {*} performance 性能模式 1、不在可见区域内自动display:none; 2、不在可见区域内自动移除内容
 * @param {*} disableupdate 是否禁用自定更新
 */
class LazyLoad extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showStatus: 0, //是否显示图片 0: 不存在不展示 1：存在不展示 2：存在展示
            offset: parseInt(props.offset) || 200, //上下缓冲值
            style: {
                width: typeof props.width === 'number' ? props.width + 'px': typeof props.width === 'string' ? props.width: '',
                height: typeof props.height === 'number' ? props.height + 'px': typeof props.height === 'string' ? props.height: '',
                ...props.style
            }
        }
    }

    componentDidMount() {
        //获取图片offset值
        setTimeout(() => {
            this.updateOffset();
            this.init();
            this.isLoaded = true;
        }, 30)
    }

    //跟新组件
    componentWillReceiveProps(nextProps) {
        if(this.isLoaded && nextProps.stamp != this.props.stamp){
            this.unload();
            this.updateOffset();
            this.init();
        }
    }

    /**
     * 注销组件移除懒加载元素
     */
    componentWillUnmount() {
        this.unload();
    }

    /**
     * 初始化
     */
    init(){
        let scrollView = this.lazyData.scrollView;
        if(!lazyLoadScrollViews.includes(scrollView)){
            lazyLoadScrollViews.push(scrollView);
            scrollLazyUpdate(scrollView);
        }
        //添加到懒加载名单
        scrollView.lazyLoadEles = scrollView.lazyLoadEles || [];
        scrollView.lazyLoadEles.push(this);
        //禁用lazyload初始检测
        if(scrollView.getAttribute('disablelazyinit') === null){
            check(this, scrollView);
        }
    }

    /**
     * 更新懒加载元素offset
     */
    updateOffset() {
        let top = 0, target = this.lazyImageEle;
        top += target.offsetTop;
        while (target.offsetParent) {
            if(target.offsetParent.getAttribute('lazyscrollview') === null){
                target = target.offsetParent;
                top += target.offsetTop;
            }else{
                break;
            }
        }
        let scrollView = target.offsetParent || document.body;
        this.lazyData = {
            offsetTop: top,
            offsetBottom: top + target.offsetHeight,
            scrollView: scrollView
        }
    }

    /**
     * 卸载懒加载
     */
    unload(){
        if(this.lazyData && this.lazyData.scrollView && this.lazyData.scrollView.lazyLoadEles){
            let index = this.lazyData.scrollView.lazyLoadEles.indexOf(this);
            if(index > -1){
                this.lazyData.scrollView.lazyLoadEles.splice(index, 1);
            }
        }
    }

    /**
     * 渲染
     */
    render() {
        const style = {
            display: this.state.showStatus === 2 ? 'initial': 'none'
        }
        return (<div ref={el => (this.lazyImageEle = el)} style={this.state.style} className={this.props.className}>
            {
                this.props.performance == 2 ?
                    (this.state.showStatus ? this.props.children : '') :
                    (this.props.performance ? <div style={style}>
                        {
                            this.state.showStatus ? this.props.children : ''
                        }
                    </div> : (this.state.showStatus ? this.props.children : ''))
            }
        </div>)
    }
}

let prevUpdateTime = 0; //上传一次刷新时间
LazyLoad.updateTime = 75; //刷新间隔

/**
 * 强制刷新scrollview
 */
LazyLoad.forceCheck = function (e, id) {
    if(typeof e === 'string' || id){
        lazyLoadScrollViews.forEach((scrollView) => {
            if(scrollView.lazyscrollview === e || scrollView.lazyscrollview === id){
                scrollView.lazyLoadEles && scrollView.lazyLoadEles.forEach((that) => {
                    check(that, scrollView);
                })
            }
        })
    }else if(typeof e === 'object'){
        let scrollView = e.currentTarget || e.target;
        for(let i = 0; i < lazyLoadScrollViews.length; i++){
            if(lazyLoadScrollViews[i] == scrollView){
                scrollView.lazyLoadEles && scrollView.lazyLoadEles.forEach((that) => {
                    check(that, scrollView);
                })
                break;
            }
        }
    }
}

/**
 * 隐藏某一个或全部已注册scrollview的懒加载图片内容
 */
LazyLoad.hide = function (id){
    lazyLoadScrollViews.forEach((scrollView) => {
        if(!id || scrollView.lazyscrollview === id){
            scrollView.lazyLoadEles && scrollView.lazyLoadEles.forEach((that) => {
                if(that.state.showStatus === 2){
                    that.setState({
                        showStatus: that.props.performance == 2 ? 0 : 1
                    })
                }
            })
        }
    })
}

/**
 * 显示某一个或全部已注册scrollview的懒加载图片内容
 */
LazyLoad.show = function (id){
    lazyLoadScrollViews.forEach((scrollView) => {
        if(!id || scrollView.lazyscrollview === id){
            LazyLoad.forceCheck({currentTarget: scrollView})
        }
    })
}

/**
 * 刷新懒加载图片
 */
function check(that, scrollView) {
    //屏蔽ios回弹滚动
    if(scrollView.clientHeight + scrollView.scrollTop > scrollView.scrollHeight || scrollView.scrollTop < 0){
        return
    }
    //刷新状态
    if((scrollView.clientHeight + scrollView.scrollTop + that.state.offset) > that.lazyData.offsetTop && (scrollView.scrollTop - that.state.offset) < that.lazyData.offsetBottom){
        if(that.state.showStatus !== 2){
            that.setState({
                showStatus: 2
            }, () => {
                typeof that.props.loaded === 'function' && that.props.loaded(that.state.showStatus, that.lazyData);
                typeof that.props.update === 'function' && that.props.update(that.state.showStatus, that.lazyData);
            })
        }
    }else if(that.state.showStatus === 2 && that.props.performance){
        that.setState({
            showStatus: that.props.performance == 2 ? 0 : 1
        }, () => {
            typeof that.props.update === 'function' && that.props.update(that.state.showStatus, that.lazyData);
        })
    }
}

/**
 * 全局更新scrollview中的懒加载图片
 * @param {*} scrollView 滚动区域
 */
function scrollLazyUpdate(scrollView){
    let uplate = () => {
        scrollView.lazyLoadEles.forEach((that) => {
            if(!that.props.disableupdate){
                check(that, scrollView);
            }
        });
    }
    scrollView.addEventListener('scroll', () => {
        let currTime = Date.now();
        if(currTime - prevUpdateTime > LazyLoad.updateTime){
            uplate();
            clearTimeout(scrollView.lazyImgScrollEnd)
            scrollView.lazyImgScrollEnd = setTimeout(() => {
                uplate();
            }, LazyLoad.updateTime * 2.1);
            prevUpdateTime = currTime;
        }
    })
}

export default LazyLoad