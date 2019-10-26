import RecoloredImage from './RecoloredImage';

export default React.forwardRef((props, ref) => {
    const { itemType, ...rest} = props;
    return <RecoloredImage ref={ref} className="toy-image" {...rest}/>;
});