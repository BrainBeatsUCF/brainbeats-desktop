import React from 'react'
import { GridSampleObject } from '../workstationPanel/gridComponents'
import AddButton from '../../../images/redAddButton.png'
import RefreshButton from '../../../images/refreshButton.png'
import './verticalListPanel.css'

const ListObjectType = {
  Sample: 'sample',
  Beat: 'beat',
}

/**
 * @param {{
 * item: GridSampleObject,
 * onClick: (item: GridSampleObject) => void
 * }} props
 */
const ListCard = props => {
  return (
    <div className="ListCard" onClick={() => props.onClick(props.item)}>
      <h5 className="ListCardTitle">{props.item.sampleTitle}</h5>
      <p className="ListCardSubtitle">{props.item.sampleSubtitle}</p>
    </div>
  )
}

class VerticalListPanel extends React.Component {
  /**
   * @param {{
   * customClassname: String?,
   * title: String,
   * itemList: [GridSampleObject],
   * onAddClick: () => void,
   * onItemClick: (item: GridSampleObject) => void,
   * itemListRequest: () => void
   * }} props
   */
  constructor(props) {
    super(props)
    this.state = {
      query: '',
      customClassname: props.customClassname ?? '',
    }
  }

  componentDidMount() {
    this.props.itemListRequest()
  }

  handleAddClick = () => {
    this.props.onAddClick()
  }

  /**
   * @param {String} queryString
   */
  setQuery = queryString => {
    this.setState({ query: queryString })
  }

  /**
   * @returns {String}
   */
  isQueryEmpty = () => {
    const { query } = this.state
    return query == null || query == undefined || query === ''
  }

  /**
   * @param {GridSampleObject} item
   * @returns {Boolean}
   */
  filterIncludeItem = item => {
    if (this.isQueryEmpty()) {
      return true
    }
    const lowercaseQuery = this.state.query.toLowerCase()
    return (
      item.sampleTitle.toLowerCase().includes(lowercaseQuery) ||
      item.sampleSubtitle.toLowerCase().includes(lowercaseQuery)
    )
  }

  /**
   * @param {GridSampleObject} item
   * @param {Number} index
   */
  handleItemClick = (item, index) => {
    this.props.onItemClick(item)
  }

  renderCards = () => {
    return this.props.itemList
      .filter(item => {
        return this.filterIncludeItem(item)
      })
      .map((item, index) => {
        return (
          <ListCard
            key={item.sampleTitle + item.sampleSubtitle + index}
            item={item}
            onClick={() => this.handleItemClick(item, index)}
          ></ListCard>
        )
      })
  }

  render() {
    return (
      <div className={`VerticalListPanel ${this.state.customClassname}`}>
        <div className="VerticalListPanelMenu">
          <h4 className="VerticalListPanelMenuTitle LeftSpot">{this.props.title}</h4>
          <img
            className="VerticalListPanelMenuButton MiddleSpot CenterSelf"
            src={RefreshButton}
            onClick={() => {
              this.props.itemListRequest()
            }}
            style={{ paddingBottom: '0.8px' }}
          ></img>
          <img
            className="VerticalListPanelMenuButton RightSpot CenterSelf"
            src={AddButton}
            onClick={() => {
              this.handleAddClick()
            }}
          ></img>
        </div>
        <input
          type="text"
          className="VerticalListPanelSearchButton"
          placeholder="Search"
          onChange={event => this.setQuery(event.target.value)}
        ></input>
        <div className="VerticalListPanelCollection">{this.renderCards()}</div>
      </div>
    )
  }
}

export { ListObjectType, VerticalListPanel }
