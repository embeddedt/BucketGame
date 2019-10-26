export default function(WrappedComponent, onAttach, onDetach, options) {
    function isFunctionalComponent(Component) {
        return (
          typeof Component === 'function' // can be various things
          && !(
            Component.prototype // native arrows don't have prototypes
            && Component.prototype.isReactComponent // special property
          )
        );
    }
    if(isFunctionalComponent(WrappedComponent))
        throw new Error("withExtLibraryHandler() only works with class (stateful) components");
    return class extends React.Component {
        constructor(props) {
            super(props);
            this.containerRef = React.createRef();
        }
        render() {
            return <WrappedComponent ref={this.containerRef} {...this.props}>
                {this.props.children}
            </WrappedComponent>;
        }
        componentDidMount() {
            if(onAttach != undefined) {
                var instance = onAttach.call(this, this.containerRef.current);
                if(options != undefined && typeof options.onReceiveLibInstance == 'function') {
                    options.onReceiveLibInstance(instance, options);
                }
            }
        }
        componentWillUnmount() {
            if(onDetach != undefined)
                onDetach.call(this, this.containerRef.current);
        }
    };
}